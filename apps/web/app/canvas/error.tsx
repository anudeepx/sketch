"use client";

import { useEffect } from "react";
import { Button } from "@repo/ui/button";

interface CanvasErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary specific to the canvas page.
 * Provides canvas-specific recovery options.
 */
export default function CanvasError({ error, reset }: CanvasErrorProps) {
  useEffect(() => {
    console.error("Canvas error:", error);
  }, [error]);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#18181b] text-white">
      <div className="max-w-md w-full text-center p-6">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2">Canvas Error</h1>
          <p className="text-zinc-400 text-sm mb-4">
            Something went wrong with the drawing canvas. Your work may not be saved.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={reset} className="w-full">
            Reload Canvas
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/join")}
            className="w-full"
          >
            Back to Rooms
          </Button>
        </div>
      </div>
    </div>
  );
}
