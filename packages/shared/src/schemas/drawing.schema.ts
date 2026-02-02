import { z } from "zod";

/**
 * Point schema for 2D coordinates
 */
export const PointSchema = z.object({
    x: z.number(),
    y: z.number(),
});

/**
 * Shape type enumeration
 */
export const ShapeTypeSchema = z.enum(["pencil", "rectangle", "circle"]);

/**
 * Base drawing properties shared by all shapes
 */
const BaseDrawingSchema = z.object({
    id: z.string().optional(),
    color: z.string(),
    timestamp: z.number().optional(),
    clientId: z.string().optional(),
});

/**
 * Pencil drawing - freeform path
 */
export const PencilDrawingSchema = BaseDrawingSchema.extend({
    type: z.literal("pencil"),
    points: z.array(PointSchema).min(1),
});

/**
 * Rectangle drawing
 */
export const RectangleDrawingSchema = BaseDrawingSchema.extend({
    type: z.literal("rectangle"),
    startPoint: PointSchema,
    width: z.number(),
    height: z.number(),
});

/**
 * Circle drawing
 */
export const CircleDrawingSchema = BaseDrawingSchema.extend({
    type: z.literal("circle"),
    center: PointSchema,
    radius: z.number().nonnegative(),
});

/**
 * Discriminated union of all drawing types
 */
export const DrawingSchema = z.discriminatedUnion("type", [
    PencilDrawingSchema,
    RectangleDrawingSchema,
    CircleDrawingSchema,
]);

/**
 * Drawing data as stored in database (flattened structure)
 */
export const DrawingDbSchema = z.object({
    id: z.string(),
    roomId: z.string(),
    type: z.string().nullable(),
    color: z.string(),
    size: z.number(),
    points: z.unknown().nullable(),
    startX: z.number().nullable(),
    startY: z.number().nullable(),
    width: z.number().nullable(),
    height: z.number().nullable(),
    centerX: z.number().nullable(),
    centerY: z.number().nullable(),
    radius: z.number().nullable(),
    createdAt: z.date(),
});
