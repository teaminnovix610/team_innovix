import { useCallback, useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { reconcileElements } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

import { useWhiteboardLoad } from "../hooks/useWhiteboardLoad";
import { useWhiteboardPersistence } from "../hooks/useWhiteboardPersistence";
import { useWhiteboardSync } from "../hooks/useWhiteboardSync";
import WhiteboardStylePicker from "./WhiteboardStylePicker";
import WhiteboardToolbar from "./WhiteboardToolbar";
import AspectRatioStage from "./AspectRatioStage";

// Lowered from 80ms -> 60ms: still comfortably above the flood we were
// seeing (Excalidraw firing on effectively every pointer-move during a
// drag, i.e. every ~16ms) so it doesn't reintroduce lossy-channel
// congestion, but a touch snappier for the remote viewer.
const BROADCAST_THROTTLE_MS = 60;
const VIEWPORT_THROTTLE_MS = 150;

// LiveKit recommends staying near the ~1400 byte network MTU for lossy
// packets (larger ones get SCTP-fragmented, and losing any one fragment
// loses the whole chunk) and under its 16KiB reliable-packet guidance.
// The old 48000 constant was 3-37x over both, which is the most likely
// cause of individual elements silently vanishing on flaky connections.
const MAX_LOSSY_PAYLOAD_BYTES = 1200;
const MAX_RELIABLE_PAYLOAD_BYTES = 15000;

// Safety net for the lossy channel. Throttling + diffing (below) cuts
// send volume, but an individual lossy packet can still be silently
// dropped under bad network conditions — that's what let an erase
// vanish on the teacher's screen but never reach a student (confirmed
// by the "dropping lossy data channel messages" log climbing steadily).
// Every SNAPSHOT_INTERVAL_MS, the teacher sends the CURRENT COMPLETE
// scene (not a diff) reliably, so any student who missed an incremental
// update self-corrects within one interval instead of staying wrong
// until they leave and rejoin.
const SNAPSHOT_INTERVAL_MS = 6000;

// Gap between successive chunks of the periodic full-scene snapshot (see
// the interval effect below). LiveKit only gives you ONE ordered
// reliable channel per room, shared by every reliable send regardless
// of topic (this snapshot, request-viewport, erase deltas, anything
// else). Firing all of a snapshot's chunks in the same tick could let
// a single burst occupy that shared queue uninterrupted for as long as
// the whole burst took to drain — worse under packet loss, since
// retransmission of an early chunk blocks everything queued behind it.
// Spacing chunks out caps how long any one snapshot can hold the queue,
// without giving up full-scene coverage.
const SNAPSHOT_CHUNK_GAP_MS = 200;

function chunkBySize(elements, maxBytes) {
  const chunks = [];
  let current = [];
  let currentSize = 2;
  for (const el of elements) {
    const size = JSON.stringify(el).length;
    if (current.length > 0 && currentSize + size > maxBytes) {
      chunks.push(current);
      current = [];
      currentSize = 2;
    }
    current.push(el);
    currentSize += size + 1;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

export default function WhiteboardCanvas({ classId, role, deviceIdentity }) {
  const canEdit = role === "TEACHER";
  const excalidrawRef = useRef(null);
  // Ref instead of document.querySelector(".whiteboard-canvas") — safer
  // if this component is ever mounted more than once on a page, since
  // querySelector would only ever find the first match.
  const containerRef = useRef(null);
  // Ref on the ACTUAL fixed-aspect-ratio box that <Excalidraw> renders
  // inside (from AspectRatioStage). This is what we measure for the
  // zoom-rescaling math below — NOT appState.width, which isn't a
  // documented/reliable field across Excalidraw versions (confirmed
  // against 0.18.1's own reference examples, which measure a wrapper
  // ref with getBoundingClientRect() themselves rather than reading it
  // off appState).
  const stageBoxRef = useRef(null);
  const applyingRemoteRef = useRef(false);
  const applyingRemoteViewportRef = useRef(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [opacity, setOpacity] = useState(100);

  // Custom toolbar state — replaces the old data-testid click-capture
  // hack. We now drive Excalidraw's tool purely through setActiveTool(),
  // so there's no dependency on Excalidraw's own internal toolbar DOM
  // (which is hidden via CSS below) and no capture-phase listener
  // racing against Excalidraw's own click handling — that race was the
  // root cause of the "double tap to select a tool" bug.
  const [activeTool, setActiveTool] = useState("selection");

  // The shared aspect ratio everyone locks to. The TEACHER measures
  // their own actual panel shape and owns this value — students
  // receive it piggybacked on viewport broadcasts (see
  // handleRemoteViewport) and just apply whatever the teacher sends,
  // same pattern as scrollX/scrollY/zoom. Starts null; AspectRatioStage
  // falls back to a default ratio until this is known.
  const [boardRatio, setBoardRatio] = useState(null);

  // Tracks Excalidraw's actual current background color
  // (appState.viewBackgroundColor) so AspectRatioStage's letterbox bars
  // can match it exactly instead of assuming white — e.g. a black
  // board shows black bars, not white ones.
  const [canvasBg, setCanvasBg] = useState("#ffffff");

  const { initialElements, loading } = useWhiteboardLoad(classId);
  const { handleChange, flushNow } = useWhiteboardPersistence({
    classId,
    updatedBy: deviceIdentity,
    canEdit,
  });

  const initialDataRef = useRef(null);
  if (initialDataRef.current === null && !loading && initialElements !== null) {
    initialDataRef.current = { elements: initialElements };
  }

  const localSceneRef = useRef(initialElements ?? []);
  const lastSentVersionRef = useRef(new Map());

  const handleRemoteUpdate = useCallback((diffElements) => {
    applyingRemoteRef.current = true;
    const reconciled = reconcileElements(
      localSceneRef.current,
      diffElements,
      excalidrawRef.current?.getAppState()
    );
    localSceneRef.current = reconciled;
    excalidrawRef.current?.updateScene({ elements: reconciled });
    setTimeout(() => {
      applyingRemoteRef.current = false;
    }, 0);
  }, []);

  // ------------------------------------------------------------------
  // Teacher-only: derive the shared aspect ratio from this device's own
  // actual panel shape, so the teacher gets zero letterboxing on their
  // own screen. Measures the OUTER container (full panel, before any
  // letterboxing is applied) — not stageBoxRef, which is already the
  // letterboxed inner box. Recomputed on resize since rotating a
  // tablet or resizing a browser window changes the teacher's own
  // panel shape too.
  useEffect(() => {
    if (!canEdit) return;
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setBoardRatio(width / height);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [canEdit]);

  // ------------------------------------------------------------------
  // Viewport sync with cross-device zoom rescaling.
  //
  // Problem: Excalidraw's zoom value maps scene units to PIXELS OF THE
  // ACTUAL CANVAS ELEMENT. A teacher's wide laptop panel and a
  // student's narrow phone panel showing the identical raw zoom number
  
  // therefore show completely different amounts of the scene — that's
  // the cropping seen in testing. AspectRatioStage fixes the SHAPE
  // (aspect ratio) so this is now a pure 1-D scaling problem: multiply
  // the sender's zoom by (myCanvasWidth / senderCanvasWidth) and the
  // visible rectangle matches exactly, on any screen size. The shared
  // ratio itself comes from the teacher's real panel shape (boardRatio)
  // rather than a hardcoded constant — see AspectRatioStage.
  //
  // lastRemoteViewportRef keeps the most recent raw teacher viewport
  // around (not just applied-and-forgotten) so a student rotating their
  // phone / resizing the panel can be re-fit immediately using the last
  // known teacher state, instead of drifting out of sync until the next
  // broadcast happens to arrive.
  const lastRemoteViewportRef = useRef(null);

  const applyScaledViewport = useCallback((viewport) => {
    const box = stageBoxRef.current;
    if (!box || !viewport?.canvasWidth) return;
    const myWidth = box.getBoundingClientRect().width;
    if (!myWidth) return;

    const scale = myWidth / viewport.canvasWidth;
    applyingRemoteViewportRef.current = true;
    excalidrawRef.current?.updateScene({
      appState: {
        scrollX: viewport.scrollX,
        scrollY: viewport.scrollY,
        zoom: { value: viewport.zoom * scale },
      },
    });
    setTimeout(() => {
      applyingRemoteViewportRef.current = false;
    }, 0);
  }, []);

  const handleRemoteViewport = useCallback(
    (viewport) => {
      if (!viewport) return;
      lastRemoteViewportRef.current = viewport;

      if (
        !canEdit &&
        viewport.canvasRatio &&
        viewport.canvasRatio > 0 &&
        viewport.canvasRatio !== boardRatio
      ) {
        // Ratio is changing — let AspectRatioStage resize first (next
        // paint), then apply using the NEW box width. Applying inline
        // here would read stageBoxRef's stale pre-resize width and
        // produce a visibly wrong zoom/crop.
        setBoardRatio(viewport.canvasRatio);
        requestAnimationFrame(() => applyScaledViewport(viewport));
        return;
      }

      applyScaledViewport(viewport);
    },
    [canEdit, boardRatio, applyScaledViewport]
  );

  // handleViewportRequested needs broadcastViewport, but useWhiteboardSync
  // needs handleViewportRequested to already exist — this ref breaks that
  // circular dependency without restructuring the hook.
  const broadcastViewportRef = useRef(null);

  // Teacher-only: when a late joiner asks "where are you looking right
  // now", answer immediately with the CURRENT viewport (not throttled —
  // this is a one-shot response, not an ongoing broadcast). Includes
  // canvasWidth (measured, not appState.width) and canvasRatio so the
  // requester can rescale AND re-shape correctly.
  const handleViewportRequested = useCallback(() => {
    const appState = excalidrawRef.current?.getAppState();
    const box = stageBoxRef.current;
    if (!appState || !box) return;
    const canvasWidth = box.getBoundingClientRect().width;
    if (!canvasWidth) return;
    broadcastViewportRef.current?.(
      {
        scrollX: appState.scrollX,
        scrollY: appState.scrollY,
        zoom: appState.zoom.value,
        canvasWidth,
        canvasRatio: boardRatio,
      },
      deviceIdentity
    );
  }, [deviceIdentity, boardRatio]);

  const { broadcastElements, broadcastViewport, requestViewport } =
    useWhiteboardSync({
      onRemoteUpdate: handleRemoteUpdate,
      onRemoteViewport: handleRemoteViewport,
      onViewportRequested: handleViewportRequested,
      selfIdentity: deviceIdentity,
      canEdit,
    });

  useEffect(() => {
    broadcastViewportRef.current = broadcastViewport;
  }, [broadcastViewport]);

  // Students: once mounted, ask the teacher where they currently are.
  // Retried twice (same pattern as ModerationProvider's request-sync)
  // since the teacher's device might not be fully ready the instant a
  // student joins.
  useEffect(() => {
    if (canEdit) return;
    requestViewport();
    const retry1 = setTimeout(requestViewport, 1200);
    const retry2 = setTimeout(requestViewport, 3000);
    return () => {
      clearTimeout(retry1);
      clearTimeout(retry2);
    };
  }, [canEdit, requestViewport]);

  // Students: if their panel resizes or the phone rotates, immediately
  // re-fit using the LAST KNOWN teacher viewport rather than waiting for
  // the next broadcast — otherwise a rotation briefly (or indefinitely,
  // if the teacher's view is currently static) shows the stale-scaled
  // view until something else triggers a new broadcast.
  useEffect(() => {
    if (canEdit) return;
    const box = stageBoxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(() => {
      if (lastRemoteViewportRef.current) {
        applyScaledViewport(lastRemoteViewportRef.current);
      }
    });
    ro.observe(box);
    return () => ro.disconnect();
  }, [canEdit, applyScaledViewport]);

  const lastSentAtRef = useRef(0);
  const pendingElementsRef = useRef(null);
  const throttleTimerRef = useRef(null);

  const scheduleBroadcast = useCallback(
    (elements) => {
      pendingElementsRef.current = elements;
      const now = Date.now();
      const elapsed = now - lastSentAtRef.current;
      const flush = () => {
        throttleTimerRef.current = null;
        lastSentAtRef.current = Date.now();
        const currentElements = pendingElementsRef.current;
        const changed = [];
        for (const el of currentElements) {
          const prevVersion = lastSentVersionRef.current.get(el.id);
          if (prevVersion !== el.version) {
            changed.push(el);
            lastSentVersionRef.current.set(el.id, el.version);
          }
        }
        if (changed.length === 0) return;

        const erased = changed.filter((el) => el.isDeleted);
        const rest = changed.filter((el) => !el.isDeleted);

        for (const chunk of chunkBySize(rest, MAX_LOSSY_PAYLOAD_BYTES)) {
          broadcastElements(chunk, deviceIdentity);
        }

        // Erases go out on BOTH channels: lossy first, for the same
        // near-instant delivery every other element gets, and reliable
        // as a backstop in case that lossy packet is dropped.
        //
        // Reliable-only (the old approach) was actually the cause of
        // erases specifically lagging several seconds behind everything
        // else: LiveKit only has ONE ordered reliable channel per room,
        // shared with the periodic full-scene snapshot below. That
        // snapshot is several ~15KB reliable chunks every
        // SNAPSHOT_INTERVAL_MS — since the reliable channel is strictly
        // ordered, an erase queued behind (or during) one of those
        // chunks has to wait for it, and for its retransmission if any
        // packet in it was lost. The lossy channel has no such queue, so
        // this dual-send gets us the same "instant" feel as draws/moves
        // while keeping the drop-proofing. handleRemoteUpdate's
        // reconcileElements dedupes by id/version, so receiving the same
        // erase twice is a no-op.
        for (const chunk of chunkBySize(erased, MAX_LOSSY_PAYLOAD_BYTES)) {
          broadcastElements(chunk, deviceIdentity);
        }
        for (const chunk of chunkBySize(erased, MAX_RELIABLE_PAYLOAD_BYTES)) {
          broadcastElements(chunk, deviceIdentity, { reliable: true });
        }
      };
      if (elapsed >= BROADCAST_THROTTLE_MS) {
        clearTimeout(throttleTimerRef.current);
        flush();
      } else if (!throttleTimerRef.current) {
        throttleTimerRef.current = setTimeout(
          flush,
          BROADCAST_THROTTLE_MS - elapsed
        );
      }
    },
    [broadcastElements, deviceIdentity]
  );

  // ------------------------------------------------------------------
  // Periodic reliable full-scene snapshot (teacher only). Runs
  // independently of scheduleBroadcast's diff/throttle logic above —
  // this always sends the CURRENT COMPLETE scene (every element,
  // including soft-deleted ones with isDeleted:true), not just what's
  // changed recently, and always reliable (via the { reliable: true }
  // option, honored by useWhiteboardSync's broadcastElements) so it
  // can't be silently dropped like an ordinary lossy update can.
  //
  // On the receiving end this needs no special handling: handleRemoteUpdate
  // just merges by element id, and since Excalidraw soft-deletes (an
  // erased element stays in the array with isDeleted:true rather than
  // being removed), merging a full snapshot naturally corrects any
  // element a student's client missed — including an erase that never
  // arrived over the lossy channel.
  useEffect(() => {
    if (!canEdit) return;

    let pendingTimeouts = [];
    const interval = setInterval(() => {
      const elements = localSceneRef.current;
      if (!elements || elements.length === 0) return;

      // Chunks are staggered instead of fired in the same tick. Firing
      // them all at once was the actual mechanism behind the erase-lag
      // bug: LiveKit's reliable channel is one ordered queue shared by
      // ALL reliable traffic (this snapshot, request-viewport, erases,
      // anything else), so a burst of several ~15KB chunks back-to-back
      // could hold up whatever else needed the reliable channel for as
      // long as that whole burst took to drain (worse under packet
      // loss, since retransmission of an early chunk blocks every chunk
      // queued after it too). Spacing them out at
      // SNAPSHOT_CHUNK_GAP_MS caps how long the snapshot can occupy the
      // queue at any one moment, without giving up full-scene coverage
      // (still protects dropped adds/moves, not just erases).
      const chunks = chunkBySize(elements, MAX_RELIABLE_PAYLOAD_BYTES);
      chunks.forEach((chunk, i) => {
        const t = setTimeout(() => {
          broadcastElements(chunk, deviceIdentity, { reliable: true });
        }, i * SNAPSHOT_CHUNK_GAP_MS);
        pendingTimeouts.push(t);
      });
    }, SNAPSHOT_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      pendingTimeouts.forEach(clearTimeout);
    };
  }, [canEdit, broadcastElements, deviceIdentity]);

  const lastViewportSentAtRef = useRef(0);
  const viewportThrottleTimerRef = useRef(null);
  const pendingViewportRef = useRef(null);

  const scheduleViewportBroadcast = useCallback(
    (viewport) => {
      pendingViewportRef.current = viewport;
      const now = Date.now();
      const elapsed = now - lastViewportSentAtRef.current;
      const flush = () => {
        viewportThrottleTimerRef.current = null;
        lastViewportSentAtRef.current = Date.now();
        broadcastViewport(pendingViewportRef.current, deviceIdentity);
      };
      if (elapsed >= VIEWPORT_THROTTLE_MS) {
        clearTimeout(viewportThrottleTimerRef.current);
        flush();
      } else if (!viewportThrottleTimerRef.current) {
        viewportThrottleTimerRef.current = setTimeout(
          flush,
          VIEWPORT_THROTTLE_MS - elapsed
        );
      }
    },
    [broadcastViewport, deviceIdentity]
  );

  const onChange = useCallback(
    (elements, appState) => {
      localSceneRef.current = elements;

      // Keep our custom toolbar's active-tool highlight in sync even
      // when the tool changes via a path our toolbar didn't trigger
      // (keyboard shortcuts, etc). Tools stay selected until another
      // is explicitly chosen — see WhiteboardToolbar, which always
      // calls setActiveTool with locked: true internally.
      if (
        appState?.activeTool?.type &&
        appState.activeTool.type !== activeTool
      ) {
        setActiveTool(appState.activeTool.type);
      }

      // Keep the letterbox bar color in sync with Excalidraw's actual
      // current background — e.g. a black board shows black bars, not
      // a mismatched white/default color.
      if (
        appState?.viewBackgroundColor &&
        appState.viewBackgroundColor !== canvasBg
      ) {
        setCanvasBg(appState.viewBackgroundColor);
      }

      if (!canEdit) return;
      if (applyingRemoteRef.current) return;
      if (applyingRemoteViewportRef.current) return;

      const box = stageBoxRef.current;
      const canvasWidth = box ? box.getBoundingClientRect().width : 0;
      if (!canvasWidth) return; // not measured yet — skip this tick rather than broadcast a bad width

      handleChange(elements);
      scheduleBroadcast(elements);
      scheduleViewportBroadcast({
        scrollX: appState.scrollX,
        scrollY: appState.scrollY,
        zoom: appState.zoom.value,
        canvasWidth,
        canvasRatio: boardRatio,
      });
    },
    [
      canEdit,
      activeTool,
      canvasBg,
      boardRatio,
      handleChange,
      scheduleBroadcast,
      scheduleViewportBroadcast,
    ]
  );

  // Custom toolbar wiring — see WhiteboardToolbar.jsx. Called directly
  // from our own buttons, so there's no dependency on Excalidraw's
  // internal toolbar DOM/testids at all anymore. Selecting a tool does
  // NOT auto-open the style picker — the tool just keeps whatever
  // stroke/bg/width was last set (like picking up a pen that remembers
  // its own ink color). The picker only opens via the palette button.
  const handleSelectTool = useCallback((type) => {
    setActiveTool(type);
  }, []);

  const handleTogglePalette = useCallback(() => {
    setPickerOpen((prev) => !prev);
  }, []);

  const handleOpacityChange = useCallback((value) => {
    setOpacity(value);
    excalidrawRef.current?.updateScene({
      appState: { currentItemOpacity: value },
    });
  }, []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  useEffect(() => {
    return () => {
      clearTimeout(throttleTimerRef.current);
      clearTimeout(viewportThrottleTimerRef.current);
      flushNow();
    };
  }, [flushNow]);

  // ------------------------------------------------------------------
  // Student lockdown, layer 2 (JS event interception).
  //
  // Layer 1 (below, in the render) is CSS: pointerEvents:"none" +
  // touchAction:"none" on the wrapper around <Excalidraw>. That's the
  // PRIMARY defense — it stops pointer/touch/wheel events from ever
  // being hit-tested against the canvas at all, and touchAction:"none"
  // stops the browser's native gesture recognizer (pinch/pan) from ever
  // starting, before any JS runs.
  //
  // This effect is a second, redundant layer on top of that, kept in
  // case any browser/WebView has a gesture path that bypasses standard
  // pointer-events/touch-action handling. Covers wheel, right-click,
  // double-click-to-zoom, standard touch events, and Safari's
  // non-standard gesturestart/gesturechange/gestureend events (fired
  // INSTEAD of multi-touch touchmove for pinch on iOS Safari).
  useEffect(() => {
    if (canEdit) return;
    const container = containerRef.current;
    if (!container) return;

    const block = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    container.addEventListener("wheel", block, {
      capture: true,
      passive: false,
    });
    container.addEventListener("contextmenu", block, { capture: true });
    container.addEventListener("dblclick", block, { capture: true });
    container.addEventListener("touchstart", block, {
      capture: true,
      passive: false,
    });
    container.addEventListener("touchmove", block, {
      capture: true,
      passive: false,
    });
    container.addEventListener("gesturestart", block, { capture: true });
    container.addEventListener("gesturechange", block, { capture: true });
    container.addEventListener("gestureend", block, { capture: true });

    const blockKeys = (e) => {
      if (
        e.key === " " ||
        e.key.startsWith("Arrow") ||
        e.key === "+" ||
        e.key === "-"
      ) {
        block(e);
      }
    };
    container.addEventListener("keydown", blockKeys, { capture: true });

    return () => {
      container.removeEventListener("wheel", block, { capture: true });
      container.removeEventListener("contextmenu", block, { capture: true });
      container.removeEventListener("dblclick", block, { capture: true });
      container.removeEventListener("touchstart", block, { capture: true });
      container.removeEventListener("touchmove", block, { capture: true });
      container.removeEventListener("gesturestart", block, { capture: true });
      container.removeEventListener("gesturechange", block, { capture: true });
      container.removeEventListener("gestureend", block, { capture: true });
      container.removeEventListener("keydown", blockKeys, { capture: true });
    };
  }, [canEdit]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white text-neutral-500 text-sm">
        Loading board…
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`whiteboard-canvas ${
        !canEdit ? "whiteboard-canvas--viewer" : ""
      }`}
      style={{ height: "100%", width: "100%", position: "relative" }}
    >
      <style>{`
        .whiteboard-canvas .App-menu__left {
          display: none !important;
        }

        /* Excalidraw's built-in hint text ("To move canvas, hold mouse
           wheel..."), always redundant now that we have our own UI. */
        .whiteboard-canvas .HintViewer {
          display: none !important;
        }

        /* Excalidraw's own top toolbar — replaced entirely by our
           custom WhiteboardToolbar. Verify this class name in devtools
           after upgrading Excalidraw versions; it's internal, not
           public API, same caveat as the selectors below. */
        .whiteboard-canvas .App-toolbar-container {
          display: none !important;
        }

        /* Student view: strip every remaining menu/UI affordance that
           viewModeEnabled alone doesn't remove — hamburger menu,
           zoom %, scroll-to-content pill, help button, top-right
           cluster. Scoped to --viewer only, teacher UI is untouched. */
        .whiteboard-canvas--viewer .main-menu-trigger,
        .whiteboard-canvas--viewer .layer-ui__wrapper__top-right,
        .whiteboard-canvas--viewer footer,
        .whiteboard-canvas--viewer .help-icon,
        .whiteboard-canvas--viewer .zoom-actions,
        .whiteboard-canvas--viewer .scroll-back-to-content {
          display: none !important;
        }
      `}</style>

      <AspectRatioStage
        innerRef={stageBoxRef}
        ratio={boardRatio}
        backgroundColor={canvasBg}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            // PRIMARY student lockdown — see block comment above.
            pointerEvents: canEdit ? "auto" : "none",
            touchAction: canEdit ? "auto" : "none",
          }}
        >
          <Excalidraw
            excalidrawAPI={(api) => {
              excalidrawRef.current = api;
            }}
            initialData={initialDataRef.current}
            onChange={onChange}
            viewModeEnabled={!canEdit}
            UIOptions={{
              canvasActions: {
                changeViewBackgroundColor: false,
                clearCanvas: false,
                export: false,
                loadScene: false,
                saveToActiveFile: false,
                saveAsImage: false,
                toggleTheme: false,
              },
            }}
          />
        </div>
      </AspectRatioStage>

      {canEdit && (
        <WhiteboardToolbar
          excalidrawAPI={excalidrawRef.current}
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          onTogglePalette={handleTogglePalette}
          paletteOpen={pickerOpen}
        />
      )}

      {canEdit && pickerOpen && (
        <WhiteboardStylePicker
          excalidrawAPI={excalidrawRef.current}
          opacity={opacity}
          onOpacityChange={handleOpacityChange}
          onOpacityCommit={closePicker}
          onApplied={closePicker}
        />
      )}
    </div>
  );
}