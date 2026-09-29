import { useCallback, useEffect, useRef } from "react";
import whiteboardService from "../services/whiteboard.service";

const DEBOUNCE_MS = 3000;
const localKey = (classId) => `whiteboard-cache:${classId}`;

export function useWhiteboardPersistence({ classId, updatedBy, canEdit }) {
  const timerRef = useRef(null);
  const pendingRef = useRef(null);

  const saveLocal = useCallback(
    (elements) => {
      try {
        localStorage.setItem(
          localKey(classId),
          JSON.stringify({ elements, ts: Date.now() })
        );
      } catch (err) {
        // localStorage can throw (quota, private browsing) — non-fatal,
        // the debounced remote save below still has us covered.
        console.warn("[whiteboard] local cache write failed", err);
      }
    },
    [classId]
  );

  const flushRemote = useCallback(async () => {
    if (!canEdit || pendingRef.current === null) return;
    const elements = pendingRef.current;
    pendingRef.current = null;
    try {
      await whiteboardService.saveWhiteboard(classId, elements, updatedBy);
    } catch (err) {
      console.error("[whiteboard] remote save failed", err);
      // Put it back so a failed save isn't silently dropped if no
      // further onChange happens to carry it forward. Re-queued through
      // the normal debounce path rather than retried inline here, so a
      // string of rapid failures (e.g. a fully dead network, or a
      // token stuck expired) can't pile up concurrent requests.
      // Note: this alone doesn't fix a genuinely expired access token —
      // every retry will 401 again until services/api.js's own
      // refresh-on-401 handling (if any) kicks in. This just stops the
      // failed save from being silently lost in the meantime.
      if (pendingRef.current === null) {
        pendingRef.current = elements;
      }
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flushRemote, DEBOUNCE_MS);
    }
  }, [classId, updatedBy, canEdit]);

  const handleChange = useCallback(
    (elements) => {
      if (!canEdit) return;

      saveLocal(elements);
      pendingRef.current = elements;

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flushRemote, DEBOUNCE_MS);
    },
    [canEdit, saveLocal, flushRemote]
  );

  const flushNow = useCallback(() => {
    clearTimeout(timerRef.current);
    return flushRemote();
  }, [flushRemote]);

  const clearLocalCache = useCallback(() => {
    try {
      localStorage.removeItem(localKey(classId));
    } catch {
      /* noop */
    }
  }, [classId]);

  // Best-effort flush on tab close/hide — not relied on as the only save
  // path (per the earlier beforeunload caveat), just an extra chance.
  useEffect(() => {
    const handler = () => flushNow();
    window.addEventListener("visibilitychange", handler);
    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("visibilitychange", handler);
      window.removeEventListener("beforeunload", handler);
    };
  }, [flushNow]);

  return { handleChange, flushNow, clearLocalCache };
}