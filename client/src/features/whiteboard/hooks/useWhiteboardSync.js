import { useCallback, useEffect } from "react";
import { useDataChannel } from "@livekit/components-react";

const WHITEBOARD_TOPIC = "whiteboard";

export function useWhiteboardSync({ onRemoteUpdate, onRemoteViewport, onViewportRequested, selfIdentity, canEdit }) {
  const { message, send } = useDataChannel(WHITEBOARD_TOPIC);

  useEffect(() => {
    if (!message) return;
    try {
      const decoded = new TextDecoder().decode(message.payload);
      const payload = JSON.parse(decoded);

      if (payload?.senderIdentity && payload.senderIdentity === selfIdentity) {
        return;
      }

      if (payload?.type === "viewport") {
        onRemoteViewport?.(payload.viewport, payload.senderIdentity);
        return;
      }

      // A late-joining student asking "where are you currently looking?"
      // Only the teacher (canEdit) responds — mirrors ModerationProvider's
      // request-sync/sync-state shape.
      if (payload?.type === "request-viewport") {
        if (canEdit) onViewportRequested?.();
        return;
      }

      if (payload?.elements) {
        onRemoteUpdate?.(payload.elements, payload.senderIdentity);
      }
    } catch (err) {
      console.error("[whiteboard] failed to parse incoming update", err);
    }
  }, [message, onRemoteUpdate, onRemoteViewport, onViewportRequested, selfIdentity, canEdit]);

  // `reliable` defaults to false (lossy) for ordinary incremental
  // updates, matching the existing behavior. WhiteboardCanvas passes
  // `{ reliable: true }` for its periodic full-scene snapshot, since
  // that one MUST land — it's the safety net for anything the lossy
  // channel silently dropped.
  const broadcastElements = useCallback(
    async (elements, senderIdentity, { reliable = false } = {}) => {
      try {
        const payload = JSON.stringify({ elements, senderIdentity, ts: Date.now() });
        await send(new TextEncoder().encode(payload), { reliable });
      } catch (err) {
        console.error("[whiteboard] failed to broadcast update", err);
      }
    },
    [send]
  );

  const broadcastViewport = useCallback(
    async (viewport, senderIdentity) => {
      try {
        const payload = JSON.stringify({ type: "viewport", viewport, senderIdentity, ts: Date.now() });
        await send(new TextEncoder().encode(payload), { reliable: false });
      } catch (err) {
        console.error("[whiteboard] failed to broadcast viewport", err);
      }
    },
    [send]
  );

  const requestViewport = useCallback(async () => {
    try {
      const payload = JSON.stringify({ type: "request-viewport", ts: Date.now() });
      await send(new TextEncoder().encode(payload), { reliable: true }); // reliable — this is a one-shot request, can't afford to drop it silently
    } catch (err) {
      console.error("[whiteboard] failed to request viewport", err);
    }
  }, [send]);

  return { broadcastElements, broadcastViewport, requestViewport };
}