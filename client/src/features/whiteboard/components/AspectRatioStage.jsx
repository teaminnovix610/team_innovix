import { useEffect, useRef, useState } from "react";

// Fallback used only until the real ratio is known (e.g. a student's
// very first render before any teacher viewport has arrived).
const DEFAULT_ASPECT_RATIO = 16 / 9;

// Wraps <Excalidraw> and forces it into a fixed-aspect-ratio box that's
// as large as possible within the available space, letterboxed (bars)
// on whichever axis doesn't match. `ratio` is passed in (the TEACHER's
// own actual panel shape, measured and broadcast by WhiteboardCanvas)
// so every device targets the same shape — the teacher gets zero
// letterboxing on their own device, and students lock to that same
// shape once it's broadcast, so "same scrollX/scrollY/zoom" still
// means "same visible rectangle" everywhere.
//
// No cropping — the board always shrinks to fit entirely inside the
// panel on both axes, so nothing is ever hidden off-screen. Any
// leftover space becomes a bar, filled with `backgroundColor` so it
// blends with whatever color the canvas actually is (matches
// Excalidraw's live viewBackgroundColor, passed down from
// WhiteboardCanvas) instead of showing as a mismatched black/white
// strip.
//
// This component only handles SHAPE (aspect ratio). It does not measure
// or broadcast actual pixel width — that's handled separately in
// WhiteboardCanvas via a ref on the inner box, since the zoom-rescaling
// math needs a live, exact pixel width at broadcast/receive time, not
// just "the ratio is locked."
export default function AspectRatioStage({ innerRef, ratio, backgroundColor, children }) {
  const outerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const effectiveRatio = ratio && ratio > 0 ? ratio : DEFAULT_ASPECT_RATIO;
  const effectiveBackground = backgroundColor || "#ffffff";

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const compute = () => {
      const { width: pw, height: ph } = el.getBoundingClientRect();
      let width = pw;
      let height = width / effectiveRatio;
      if (height > ph) {
        height = ph;
        width = height * effectiveRatio;
      }
      setSize({ width, height });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [effectiveRatio]);

  return (
    <div
      ref={outerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: effectiveBackground, // bars — matches Excalidraw's actual current background color
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: size.width,
          height: size.height,
          background: effectiveBackground,
          position: "relative",
        }}
      >
        {size.width > 0 && children}
      </div>
    </div>
  );
}