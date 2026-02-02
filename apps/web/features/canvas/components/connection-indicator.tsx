"use client";

import type { ConnectionStatus } from "@repo/shared/types";

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
}

const STATUS_CONFIG: Record<ConnectionStatus, { text: string; className: string }> = {
  connected: {
    text: "Connected",
    className: "text-green-800 bg-green-200",
  },
  connecting: {
    text: "Connecting...",
    className: "text-yellow-800 bg-yellow-200",
  },
  disconnected: {
    text: "Disconnected",
    className: "text-gray-800 bg-gray-200",
  },
  error: {
    text: "Connection Error",
    className: "text-red-800 bg-red-200",
  },
};

/**
 * Connection status indicator badge.
 */
export function ConnectionIndicator({ status }: ConnectionIndicatorProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.text}
    </div>
  );
}
