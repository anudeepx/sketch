"use client";

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

/**
 * Zoom controls for canvas navigation.
 */
export function ZoomControls({ zoomLevel, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onZoomIn}
        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-full flex items-center justify-center shadow-lg transition-colors"
        title="Zoom In"
        aria-label="Zoom In"
      >
        +
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-full flex items-center justify-center shadow-lg transition-colors"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        -
      </button>
      <button
        type="button"
        onClick={onReset}
        className="w-10 h-10 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-full flex items-center justify-center shadow-lg transition-colors"
        title="Reset Zoom"
        aria-label="Reset Zoom"
      >
        ⌂
      </button>
      <div className="bg-black/50 text-white px-2 py-1 rounded text-sm text-center mt-2">
        {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
}
