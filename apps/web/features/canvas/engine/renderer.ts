import type { Point, Drawing } from "@repo/shared/types";

/**
 * Renderer configuration options.
 */
export interface RendererConfig {
    /** Default stroke width */
    strokeWidth: number;
    /** Enable anti-aliasing */
    smoothing: boolean;
}

/**
 * Default renderer configuration.
 */
export const DEFAULT_RENDERER_CONFIG: RendererConfig = {
    strokeWidth: 2,
    smoothing: true,
};

/**
 * Canvas renderer responsible for drawing shapes.
 * Separated from React to enable testing and reuse.
 */
export class CanvasRenderer {
    private ctx: CanvasRenderingContext2D;
    private config: RendererConfig;

    constructor(ctx: CanvasRenderingContext2D, config: Partial<RendererConfig> = {}) {
        this.ctx = ctx;
        this.config = { ...DEFAULT_RENDERER_CONFIG, ...config };
        this.applyConfig();
    }

    /**
     * Apply configuration to canvas context.
     */
    private applyConfig(): void {
        this.ctx.imageSmoothingEnabled = this.config.smoothing;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
    }

    /**
     * Clear the entire canvas.
     */
    clear(width: number, height: number): void {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.restore();
    }

    /**
     * Draw a single shape.
     */
    drawShape(shape: Drawing): void {
        this.ctx.save();
        this.ctx.strokeStyle = shape.color;
        this.ctx.fillStyle = shape.color;
        this.ctx.lineWidth = this.config.strokeWidth;

        switch (shape.type) {
            case "pencil":
                this.drawPencil(shape.points);
                break;
            case "rectangle":
                this.drawRectangle(shape.startPoint, shape.width, shape.height);
                break;
            case "circle":
                this.drawCircle(shape.center, shape.radius);
                break;
        }

        this.ctx.restore();
    }

    /**
     * Draw multiple shapes.
     */
    drawShapes(shapes: Drawing[]): void {
        shapes.forEach((shape) => this.drawShape(shape));
    }

    /**
     * Apply zoom and pan transformations.
     */
    applyTransform(zoom: number, pan: Point): void {
        this.ctx.scale(zoom, zoom);
        this.ctx.translate(pan.x, pan.y);
    }

    /**
     * Save current transformation state.
     */
    save(): void {
        this.ctx.save();
    }

    /**
     * Restore previous transformation state.
     */
    restore(): void {
        this.ctx.restore();
    }

    private drawPencil(points: Point[]): void {
        if (points.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(points[0]!.x, points[0]!.y);

        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i]!.x, points[i]!.y);
        }

        this.ctx.stroke();
    }

    private drawRectangle(startPoint: Point, width: number, height: number): void {
        this.ctx.strokeRect(startPoint.x, startPoint.y, width, height);
    }

    private drawCircle(center: Point, radius: number): void {
        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
}
