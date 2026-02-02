"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasEngine } from "../engine";
import type { Drawing, CanvasState, ShapeType } from "@repo/shared/types";
import { createInitialCanvasState } from "@repo/shared/types";

interface UseCanvasEngineOptions {
    onDrawingComplete?: (drawing: Drawing) => void;
}

/**
 * React hook that wraps the CanvasEngine for use in components.
 * Handles lifecycle, state synchronization, and event binding.
 */
export function useCanvasEngine({ onDrawingComplete }: UseCanvasEngineOptions = {}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<CanvasEngine | null>(null);
    const [canvasState, setCanvasState] = useState<CanvasState>(createInitialCanvasState());
    const [drawings, setDrawings] = useState<Drawing[]>([]);

    // Initialize engine
    useEffect(() => {
        engineRef.current = new CanvasEngine({
            onDrawingComplete: (drawing) => {
                setDrawings((prev) => [...prev, drawing]);
                onDrawingComplete?.(drawing);
            },
            onStateChange: setCanvasState,
        });

        return () => {
            engineRef.current?.detach();
            engineRef.current = null;
        };
    }, [onDrawingComplete]);

    // Attach canvas when available
    useEffect(() => {
        const canvas = canvasRef.current;
        const engine = engineRef.current;

        if (canvas && engine) {
            engine.attach(canvas);

            const handleResize = () => engine.resize();
            window.addEventListener("resize", handleResize);

            return () => {
                window.removeEventListener("resize", handleResize);
                engine.detach();
            };
        }
    }, []);

    // Sync external drawings to engine
    const syncDrawings = useCallback((newDrawings: Drawing[]) => {
        setDrawings(newDrawings);
        engineRef.current?.setDrawings(newDrawings);
    }, []);

    // Event handlers
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        engineRef.current?.handlePointerDown(e.clientX, e.clientY);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        engineRef.current?.handlePointerMove(e.clientX, e.clientY);
    }, []);

    const handleMouseUp = useCallback(() => {
        engineRef.current?.handlePointerUp();
    }, []);

    // State update helpers
    const setColor = useCallback((color: string) => {
        engineRef.current?.setColor(color);
    }, []);

    const setTool = useCallback((tool: ShapeType) => {
        engineRef.current?.setTool(tool);
    }, []);

    const zoomIn = useCallback(() => {
        engineRef.current?.zoomIn();
    }, []);

    const zoomOut = useCallback(() => {
        engineRef.current?.zoomOut();
    }, []);

    const resetZoom = useCallback(() => {
        engineRef.current?.resetView();
    }, []);

    const clearCanvas = useCallback(() => {
        engineRef.current?.clearDrawings();
        setDrawings([]);
    }, []);

    return {
        canvasRef,
        canvasState,
        drawings,
        setDrawings: syncDrawings,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        setColor,
        setTool,
        zoomIn,
        zoomOut,
        resetZoom,
        clearCanvas,
    };
}
