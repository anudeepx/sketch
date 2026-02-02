import type { Point, ShapeType, Drawing, CanvasState } from "@repo/shared/types";
import { createInitialCanvasState, ZOOM_CONFIG } from "@repo/shared/types";
import { CanvasRenderer } from "./renderer";

/**
 * Event callbacks for canvas interactions.
 */
export interface CanvasEngineCallbacks {
    onDrawingComplete?: (drawing: Drawing) => void;
    onStateChange?: (state: CanvasState) => void;
}

/**
 * Canvas engine that handles all drawing logic.
 * Framework-agnostic - can be used with React, Vue, or vanilla JS.
 */
export class CanvasEngine {
    private canvas: HTMLCanvasElement | null = null;
    private renderer: CanvasRenderer | null = null;
    private state: CanvasState;
    private drawings: Drawing[] = [];
    private animationFrameId: number | null = null;
    private callbacks: CanvasEngineCallbacks;
    private dpr: number = 1;

    constructor(callbacks: CanvasEngineCallbacks = {}) {
        this.state = createInitialCanvasState();
        this.callbacks = callbacks;
    }

    /**
     * Attach canvas element and initialize rendering context.
     */
    attach(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.setupCanvas();
        this.scheduleRedraw();
    }

    /**
     * Detach canvas and cleanup resources.
     */
    detach(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.canvas = null;
        this.renderer = null;
    }

    /**
     * Handle window resize.
     */
    resize(): void {
        this.setupCanvas();
        this.scheduleRedraw();
    }

    /**
     * Get current canvas state.
     */
    getState(): CanvasState {
        return { ...this.state };
    }

    /**
     * Get all drawings.
     */
    getDrawings(): Drawing[] {
        return [...this.drawings];
    }

    /**
     * Set drawings (e.g., from server sync).
     */
    setDrawings(drawings: Drawing[]): void {
        this.drawings = [...drawings];
        this.scheduleRedraw();
    }

    /**
     * Add a new drawing.
     */
    addDrawing(drawing: Drawing): void {
        this.drawings.push(drawing);
        this.scheduleRedraw();
    }

    /**
     * Clear all drawings.
     */
    clearDrawings(): void {
        this.drawings = [];
        this.updateState({
            currentDrawing: null,
            isDrawing: false,
            startPoint: null,
        });
        this.scheduleRedraw();
    }

    /**
     * Update canvas state.
     */
    updateState(updates: Partial<CanvasState>): void {
        this.state = { ...this.state, ...updates };
        this.callbacks.onStateChange?.(this.getState());
        this.scheduleRedraw();
    }

    /**
     * Set selected shape tool.
     */
    setTool(shape: ShapeType): void {
        this.updateState({ selectedShape: shape });
    }

    /**
     * Set drawing color.
     */
    setColor(color: string): void {
        this.updateState({ color });
    }

    /**
     * Zoom in.
     */
    zoomIn(): void {
        const newZoom = Math.min(this.state.zoomLevel + ZOOM_CONFIG.STEP, ZOOM_CONFIG.MAX);
        this.updateState({ zoomLevel: newZoom });
    }

    /**
     * Zoom out.
     */
    zoomOut(): void {
        const newZoom = Math.max(this.state.zoomLevel - ZOOM_CONFIG.STEP, ZOOM_CONFIG.MIN);
        this.updateState({ zoomLevel: newZoom });
    }

    /**
     * Reset zoom and pan.
     */
    resetView(): void {
        this.updateState({
            zoomLevel: 1,
            panOffset: { x: 0, y: 0 },
        });
    }

    /**
     * Handle mouse/touch down event.
     */
    handlePointerDown(clientX: number, clientY: number): void {
        const position = this.getCanvasPosition(clientX, clientY);
        const newDrawing = this.createDrawing(position);

        this.updateState({
            isDrawing: true,
            startPoint: position,
            currentDrawing: newDrawing,
        });
    }

    /**
     * Handle mouse/touch move event.
     */
    handlePointerMove(clientX: number, clientY: number): void {
        if (!this.state.isDrawing || !this.state.startPoint || !this.state.currentDrawing) {
            return;
        }

        const position = this.getCanvasPosition(clientX, clientY);
        const updatedDrawing = this.updateCurrentDrawing(position);

        this.updateState({ currentDrawing: updatedDrawing });
    }

    /**
     * Handle mouse/touch up event.
     */
    handlePointerUp(): void {
        if (!this.state.isDrawing || !this.state.currentDrawing) {
            return;
        }

        const finalDrawing = this.state.currentDrawing;
        this.drawings.push(finalDrawing);

        this.updateState({
            isDrawing: false,
            startPoint: null,
            currentDrawing: null,
        });

        this.callbacks.onDrawingComplete?.(finalDrawing);
    }

    /**
     * Set up canvas dimensions and context.
     */
    private setupCanvas(): void {
        if (!this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        this.dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;

        const ctx = this.canvas.getContext("2d");
        if (ctx) {
            ctx.scale(this.dpr, this.dpr);
            this.renderer = new CanvasRenderer(ctx);
        }
    }

    /**
     * Schedule a redraw on the next animation frame.
     */
    private scheduleRedraw(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.animationFrameId = requestAnimationFrame(() => this.redraw());
    }

    /**
     * Redraw the entire canvas.
     */
    private redraw(): void {
        if (!this.canvas || !this.renderer) return;

        const rect = this.canvas.getBoundingClientRect();

        this.renderer.clear(this.canvas.width, this.canvas.height);
        this.renderer.save();
        this.renderer.applyTransform(this.state.zoomLevel, this.state.panOffset);

        // Draw all completed shapes
        this.renderer.drawShapes(this.drawings);

        // Draw current in-progress shape
        if (this.state.currentDrawing) {
            this.renderer.drawShape(this.state.currentDrawing);
        }

        this.renderer.restore();
    }

    /**
     * Convert client coordinates to canvas coordinates.
     */
    private getCanvasPosition(clientX: number, clientY: number): Point {
        if (!this.canvas) return { x: 0, y: 0 };

        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) / this.state.zoomLevel - this.state.panOffset.x,
            y: (clientY - rect.top) / this.state.zoomLevel - this.state.panOffset.y,
        };
    }

    /**
     * Create a new drawing based on current tool.
     */
    private createDrawing(position: Point): Drawing {
        switch (this.state.selectedShape) {
            case "rectangle":
                return {
                    type: "rectangle",
                    color: this.state.color,
                    startPoint: position,
                    width: 0,
                    height: 0,
                };
            case "circle":
                return {
                    type: "circle",
                    color: this.state.color,
                    center: position,
                    radius: 0,
                };
            case "pencil":
            default:
                return {
                    type: "pencil",
                    color: this.state.color,
                    points: [position],
                };
        }
    }

    /**
     * Update the current in-progress drawing.
     */
    private updateCurrentDrawing(position: Point): Drawing {
        const current = this.state.currentDrawing!;
        const start = this.state.startPoint!;

        switch (current.type) {
            case "pencil":
                return {
                    ...current,
                    points: [...current.points, position],
                };
            case "rectangle":
                return {
                    ...current,
                    width: position.x - start.x,
                    height: position.y - start.y,
                };
            case "circle":
                return {
                    ...current,
                    radius: Math.hypot(position.x - start.x, position.y - start.y),
                };
        }
    }
}
