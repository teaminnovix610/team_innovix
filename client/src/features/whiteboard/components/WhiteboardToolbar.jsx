import {
  Hand,
  MousePointer2,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  Pencil,
  Type,
  Image as ImageIcon,
  Eraser,
  Flashlight,
  Palette,
} from "lucide-react";

const TOOLS = [
  { type: "selection", Icon: MousePointer2, label: "Select" },
  { type: "hand", Icon: Hand, label: "Pan" },
  { type: "rectangle", Icon: Square, label: "Rectangle" },
  { type: "diamond", Icon: Diamond, label: "Diamond" },
  { type: "ellipse", Icon: Circle, label: "Ellipse" },
  { type: "arrow", Icon: ArrowRight, label: "Arrow" },
  { type: "line", Icon: Minus, label: "Line" },
  { type: "freedraw", Icon: Pencil, label: "Pen" },
  { type: "text", Icon: Type, label: "Text" },
  { type: "image", Icon: ImageIcon, label: "Image" },
  { type: "eraser", Icon: Eraser, label: "Eraser" },
  { type: "laser", Icon: Flashlight, label: "Laser pointer" },
];

export default function WhiteboardToolbar({
  excalidrawAPI,
  activeTool,
  onSelectTool,
  onTogglePalette,
  paletteOpen,
}) {
  const handleToolClick = (type) => {
    // locked: true always — the tool stays selected after each use
    // instead of Excalidraw's default of auto-reverting to Selection.
    // This isn't exposed to the user as a "lock" concept, it's just
    // how tools behave here.
    excalidrawAPI?.setActiveTool({ type, locked: true });
    onSelectTool(type);
  };

  return (
    <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-white border border-black/10 rounded-lg shadow-lg px-1.5 py-1.5 flex-wrap max-w-[92vw]">
      {TOOLS.map(({ type, Icon, label }) => {
        const isActive = activeTool === type;
        return (
          <button
            key={type}
            type="button"
            title={label}
            onClick={() => handleToolClick(type)}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              isActive ? "bg-indigo-100 text-indigo-600" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}

      <div className="w-px h-6 bg-black/10 mx-0.5" />

      <button
        type="button"
        title="Style"
        onClick={onTogglePalette}
        className={`w-8 h-8 flex items-center justify-center rounded ${
          paletteOpen ? "bg-orange-100 text-orange-600" : "text-neutral-600 hover:bg-neutral-100"
        }`}
      >
        <Palette size={16} />
      </button>
    </div>
  );
}