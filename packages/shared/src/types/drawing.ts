import { z } from "zod";
import {
    PointSchema,
    ShapeTypeSchema,
    PencilDrawingSchema,
    RectangleDrawingSchema,
    CircleDrawingSchema,
    DrawingSchema,
    DrawingDbSchema,
} from "../schemas/drawing.schema";

/**
 * 2D coordinate point
 */
export type Point = z.infer<typeof PointSchema>;

/**
 * Available shape types for drawing
 */
export type ShapeType = z.infer<typeof ShapeTypeSchema>;

/**
 * Pencil drawing - freeform path with multiple points
 */
export type PencilDrawing = z.infer<typeof PencilDrawingSchema>;

/**
 * Rectangle drawing
 */
export type RectangleDrawing = z.infer<typeof RectangleDrawingSchema>;

/**
 * Circle drawing
 */
export type CircleDrawing = z.infer<typeof CircleDrawingSchema>;

/**
 * Union type for all drawing variants
 */
export type Drawing = z.infer<typeof DrawingSchema>;

/**
 * Database representation of a drawing
 */
export type DrawingDb = z.infer<typeof DrawingDbSchema>;

/**
 * Data required to create a new drawing in the database
 */
export interface CreateDrawingData {
    roomId: string;
    type: ShapeType;
    color: string;
    size?: number;
    points?: Point[];
    startX?: number;
    startY?: number;
    width?: number;
    height?: number;
    centerX?: number;
    centerY?: number;
    radius?: number;
}
