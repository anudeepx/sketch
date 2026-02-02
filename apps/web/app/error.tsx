"use client";

import { useEffect } from "react";
import { Button } from "@repo/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for the application.
 * Catches unhandled errors and provides recovery options.
 */
export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-4">
      <div className="max-w-md w-full text-center">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-zinc-400 mb-4">
            An unexpected error occurred. Please try again.
          </p>
          {error.digest && (
            <p className="text-xs text-zinc-500 mb-4">Error ID: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={reset} className="w-full">
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="w-full"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
