import { useEffect, useState } from "react";
import whiteboardService from "../services/whiteboard.service";

const localKey = (classId) => `whiteboard-cache:${classId}`;

export function useWhiteboardLoad(classId) {
  const [initialElements, setInitialElements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      // Local cache first — instant, and covers the case where the fetch
      // below stalls on a bad connection.
      let localElements = null;
      try {
        const raw = localStorage.getItem(localKey(classId));
        if (raw) localElements = JSON.parse(raw)?.elements ?? null;
      } catch {
        // corrupted/inaccessible cache — ignore, server fetch below covers us
      }

      if (localElements && !cancelled) {
        setInitialElements(localElements);
      }

      // Server is the source of truth — overwrite once it arrives.
      try {
        const data = await whiteboardService.getWhiteboard(classId);
        if (cancelled) return;
        setInitialElements(data.elements ?? localElements ?? []);
      } catch (err) {
        if (cancelled) return;
        console.error("[whiteboard] failed to load from server", err);
        setError(err);
        if (!localElements) setInitialElements([]); // don't block render on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [classId]);

  return { initialElements, loading, error };
}