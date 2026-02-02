"use client";

import { Pencil, Square, Circle, X, Share } from "lucide-react";
import type { ShapeType } from "@repo/shared/types";
import { IconButtonWithTooltip } from "@/components/IconButtonWithTooltip";
import React from "react";

interface ToolConfig {
  shape: ShapeType;
  Icon: typeof Pencil;
  label: string;
}

const TOOLS: ToolConfig[] = [
  { shape: "pencil", Icon: Pencil, label: "Pencil" },
  { shape: "rectangle", Icon: Square, label: "Rectangle" },
  { shape: "circle", Icon: Circle, label: "Circle" },
];

export interface CanvasControlsProps {
  selectedShape: ShapeType;
  currentColor: string;
  onShapeSelect: (shape: ShapeType) => void;
  onColorChange: (color: string) => void;
  onClear: () => void;
  onShare: () => void;
}

/**
 * Canvas toolbar controls for shape selection, color, clear, and share.
 */
export function CanvasControls({
  selectedShape,
  currentColor,
  onShapeSelect,
  onColorChange,
  onClear,
  onShare,
}: CanvasControlsProps) {
  return (
    <div className="bg-[#18181b] flex justify-center items-center gap-4 p-2 rounded-lg shadow-lg">
      {TOOLS.map(({ shape, Icon, label }) => (
        <IconButtonWithTooltip key={shape} label={label}>
          <button
            type="button"
            className={`w-10 h-10 flex justify-center items-center rounded-lg border-2 transition-all duration-300 hover:scale-110 ${
              selectedShape === shape
                ? "bg-[#fef08a] text-black border-[#fef08a]"
                : "bg-transparent text-[#fef08a] border-[#fef08a]"
            }`}
            onClick={() => onShapeSelect(shape)}
            aria-label={label}
            aria-pressed={selectedShape === shape}
          >
            <Icon size={20} color={selectedShape === shape ? "black" : "white"} />
          </button>
        </IconButtonWithTooltip>
      ))}

      <IconButtonWithTooltip label="Pick Color">
        <label
          className="relative w-10 h-10 rounded-lg border-2 border-[#fef08a] cursor-pointer transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: currentColor }}
        >
          <input
            type="color"
            className="absolute opacity-0 w-full h-full cursor-pointer"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            aria-label="Select Color"
          />
        </label>
      </IconButtonWithTooltip>

      <IconButtonWithTooltip label="Clear Canvas">
        <button
          type="button"
          className="w-10 h-10 flex justify-center items-center rounded-lg border-2 border-[#f87171] text-[#f87171] transition-all duration-300 hover:scale-110 hover:bg-[#f87171] hover:text-black"
          onClick={onClear}
          aria-label="Clear Canvas"
        >
          <X size={20} color="currentColor" />
        </button>
      </IconButtonWithTooltip>

      <IconButtonWithTooltip label="Share">
        <button
          type="button"
          className="w-10 h-10 flex justify-center items-center rounded-lg border-2 border-[#fef08a] text-[#fef08a] transition-all duration-300 hover:scale-110 hover:bg-[#fef08a] hover:text-black"
          onClick={onShare}
          aria-label="Share"
        >
          <Share size={20} color="currentColor" />
        </button>
      </IconButtonWithTooltip>
    </div>
  );
}
