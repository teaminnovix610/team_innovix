import { X } from "lucide-react";

const STROKE_COLORS = [
  "#1e1e1e",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#f08c00",
  "#e64980",
  "#ffffff",
];
const BG_COLORS = ["transparent", "#ffc9c9", "#b2f2bb", "#a5d8ff", "#ffec99"];
const STROKE_WIDTHS = [
  { label: "Thin", value: 1 },
  { label: "Medium", value: 2 },
  { label: "Bold", value: 4 },
];

export default function WhiteboardStylePicker({
  excalidrawAPI,
  opacity,
  onOpacityChange,
  onOpacityCommit,
  onApplied,
}) {
  const applyProp = (key, value) => {
    excalidrawAPI?.updateScene({ appState: { [key]: value } });
    const selected = excalidrawAPI?.getAppState()?.selectedElementIds;
    if (selected && Object.keys(selected).length > 0) {
      const propMap = {
        currentItemStrokeColor: "strokeColor",
        currentItemBackgroundColor: "backgroundColor",
        currentItemStrokeWidth: "strokeWidth",
      };
      const elProp = propMap[key];
      if (elProp) {
        const elements = excalidrawAPI
          .getSceneElements()
          .map((el) => (selected[el.id] ? { ...el, [elProp]: value } : el));
        excalidrawAPI.updateScene({ elements });
      }
    }
    onApplied?.();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      // top-14/left-2 on small screens (this app is landscape-locked, so
      // "small" here mainly means SHORT height, not narrow width) with
      // more room on sm+. max-h + overflow-y-auto so a short landscape
      // phone screen scrolls the panel instead of clipping the opacity
      // slider off the bottom.
      className="absolute top-14 left-2 sm:top-20 sm:left-3 z-20 bg-white border border-black/10 rounded-lg shadow-lg p-2.5 sm:p-3 flex flex-col gap-2.5 sm:gap-3 w-40 sm:w-44 max-h-[70vh] overflow-y-auto"
    >
      <button
        type="button"
        onClick={onApplied}
        title="Close"
        className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
      >
        <X size={14} />
      </button>

      <div>
        <div className="text-[11px] text-neutral-500 mb-1">Stroke</div>
        <div className="flex gap-2 sm:gap-1.5 flex-wrap">
          {STROKE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => applyProp("currentItemStrokeColor", color)}
              // 32px on small screens (touch target), 24px on sm+ where
              // mouse precision makes the smaller size fine.
              className="w-8 h-8 sm:w-6 sm:h-6 rounded-full shrink-0"
              style={{
                backgroundColor: color,
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.9), 0 0 0 2px rgba(0,0,0,0.35)",
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] text-neutral-500 mb-1">Background</div>
        <div className="flex gap-2 sm:gap-1.5 flex-wrap">
          {BG_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => applyProp("currentItemBackgroundColor", color)}
              className="w-8 h-8 sm:w-6 sm:h-6 rounded-full shrink-0"
              style={{
                backgroundColor: color === "transparent" ? "#fff" : color,
                backgroundImage:
                  color === "transparent"
                    ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%)"
                    : "none",
                backgroundSize: "6px 6px",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.9), 0 0 0 2px rgba(0,0,0,0.35)",
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] text-neutral-500 mb-1">Stroke width</div>
        <div className="flex gap-1">
          {STROKE_WIDTHS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => applyProp("currentItemStrokeWidth", value)}
              title={label}
              className="flex-1 h-9 sm:h-7 flex items-center justify-center rounded bg-neutral-100 hover:bg-neutral-200"
            >
              <div
                style={{
                  height: value,
                  width: 16,
                  backgroundColor: "#1e1e1e",
                  borderRadius: 2,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] text-neutral-500 mb-1 flex justify-between">
          <span>Opacity</span>
          <span>{opacity}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          onMouseUp={onOpacityCommit}
          onTouchEnd={onOpacityCommit}
          className="w-full h-6 sm:h-auto"
        />
      </div>
    </div>
  );
}