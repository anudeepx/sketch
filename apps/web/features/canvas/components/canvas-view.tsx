"use client";

import { useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCanvasEngine } from "@/features/canvas";
import { useWebSocket } from "@/features/realtime";
import {
  CanvasControls,
  ZoomControls,
  ConnectionIndicator,
} from "@/features/canvas";
import type { Drawing, ServerMessage } from "@repo/shared/types";
import { WebSocketMessageType } from "@repo/shared/schemas";

interface CanvasViewProps {
  roomId: string;
  wsUrl: string;
}

/**
 * Canvas view component with real-time collaboration.
 * Handles WebSocket sync and canvas interactions.
 */
export function CanvasView({ roomId, wsUrl }: CanvasViewProps) {
  const router = useRouter();

  // Handle drawing completion - send to server
  const handleDrawingComplete = useCallback((drawing: Drawing) => {
    sendMessage({
      type: WebSocketMessageType.DRAWING,
      room: roomId,
      drawingData: drawing,
    });
  }, [roomId]);

  // Initialize canvas engine
  const {
    canvasRef,
    canvasState,
    setDrawings,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    setColor,
    setTool,
    zoomIn,
    zoomOut,
    resetZoom,
    clearCanvas,
  } = useCanvasEngine({ onDrawingComplete: handleDrawingComplete });

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case WebSocketMessageType.INITIAL_DRAWINGS:
        if (Array.isArray(message.data)) {
          setDrawings(message.data);
        }
        break;

      case WebSocketMessageType.DRAWING_BROADCAST:
        if (message.drawingData) {
          setDrawings((prev) => [...prev, message.drawingData]);
        }
        break;

      case WebSocketMessageType.CANVAS_CLEARED:
        clearCanvas();
        toast.info("Canvas cleared");
        break;

      case WebSocketMessageType.USER_JOINED:
        toast.info(`User joined (${message.clientCount} online)`);
        break;

      case WebSocketMessageType.USER_LEFT:
        toast.info(`User left (${message.clientCount} online)`);
        break;

      case WebSocketMessageType.ERROR:
        toast.error(message.message || "WebSocket error occurred");
        break;
    }
  }, [setDrawings, clearCanvas]);

  // Handle WebSocket errors
  const handleWebSocketError = useCallback(() => {
    toast.error("Connection error occurred");
  }, []);

  // Initialize WebSocket connection
  const {
    connect,
    disconnect,
    sendMessage,
    connectionStatus,
    isConnected,
  } = useWebSocket({
    url: wsUrl,
    roomId,
    onMessage: handleWebSocketMessage,
    onError: handleWebSocketError,
  });

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Handle clear canvas with server sync
  const handleClearCanvas = useCallback(() => {
    clearCanvas();
    if (isConnected) {
      sendMessage({
        type: WebSocketMessageType.CLEAR_CANVAS,
        room: roomId,
      });
    }
  }, [clearCanvas, isConnected, sendMessage, roomId]);

  // Handle share button
  const handleShare = useCallback(() => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("Share URL copied to clipboard!"))
      .catch(() => toast.error("Failed to copy URL to clipboard"));
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-[#18181b]">
      {/* Connection Status */}
      <div className="absolute top-4 left-4 z-30">
        <ConnectionIndicator status={connectionStatus} />
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <CanvasControls
          selectedShape={canvasState.selectedShape}
          currentColor={canvasState.color}
          onShapeSelect={setTool}
          onColorChange={setColor}
          onClear={handleClearCanvas}
          onShare={handleShare}
        />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (canvasState.isDrawing) {
            handleMouseUp();
          }
        }}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 z-20">
        <ZoomControls
          zoomLevel={canvasState.zoomLevel}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetZoom}
        />
      </div>
    </div>
  );
}
