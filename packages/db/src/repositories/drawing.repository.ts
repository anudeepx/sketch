import { prisma } from "../client";
import type { Drawing, CreateDrawingData, Point } from "@repo/shared/types";

/**
 * Repository for drawing-related database operations.
 * Encapsulates all Prisma interactions for the Drawing model.
 */
export const drawingRepository = {
    /**
     * Retrieve all drawings for a specific room, ordered by creation time.
     */
    async findByRoomId(roomId: string): Promise<Drawing[]> {
        const drawings = await prisma.drawing.findMany({
            where: { roomId },
            orderBy: { createdAt: "asc" },
        });

        return drawings.map(mapDbToDrawing);
    },

    /**
     * Create a new drawing in the database.
     */
    async create(data: CreateDrawingData): Promise<string> {
        const drawing = await prisma.drawing.create({
            data: {
                roomId: data.roomId,
                type: data.type,
                color: data.color,
                size: data.size ?? 2,
                points: data.points ?? null,
                startX: data.startX ?? null,
                startY: data.startY ?? null,
                width: data.width ?? null,
                height: data.height ?? null,
                centerX: data.centerX ?? null,
                centerY: data.centerY ?? null,
                radius: data.radius ?? null,
            },
        });

        return drawing.id;
    },

    /**
     * Delete all drawings for a specific room.
     */
    async deleteByRoomId(roomId: string): Promise<number> {
        const result = await prisma.drawing.deleteMany({
            where: { roomId },
        });

        return result.count;
    },

    /**
     * Delete a specific drawing by ID.
     */
    async deleteById(id: string): Promise<boolean> {
        try {
            await prisma.drawing.delete({
                where: { id },
            });
            return true;
        } catch {
            return false;
        }
    },
};

/**
 * Maps database drawing record to domain Drawing type.
 * Handles the flattened DB structure -> nested domain structure conversion.
 */
function mapDbToDrawing(record: {
    id: string;
    type: string | null;
    color: string;
    size: number;
    points: unknown;
    startX: number | null;
    startY: number | null;
    width: number | null;
    height: number | null;
    centerX: number | null;
    centerY: number | null;
    radius: number | null;
    createdAt: Date;
}): Drawing {
    const baseProps = {
        id: record.id,
        color: record.color,
        timestamp: record.createdAt.getTime(),
    };

    const type = record.type ?? "pencil";

    switch (type) {
        case "rectangle":
            return {
                ...baseProps,
                type: "rectangle",
                startPoint: {
                    x: record.startX ?? 0,
                    y: record.startY ?? 0,
                },
                width: record.width ?? 0,
                height: record.height ?? 0,
            };

        case "circle":
            return {
                ...baseProps,
                type: "circle",
                center: {
                    x: record.centerX ?? 0,
                    y: record.centerY ?? 0,
                },
                radius: record.radius ?? 0,
            };

        case "pencil":
        default:
            return {
                ...baseProps,
                type: "pencil",
                points: parsePoints(record.points),
            };
    }
}

/**
 * Safely parse points from JSON storage.
 */
function parsePoints(points: unknown): Point[] {
    if (!points) return [];

    if (Array.isArray(points)) {
        return points.map((p) => {
            if (typeof p === "object" && p !== null && "x" in p && "y" in p) {
                return { x: Number(p.x), y: Number(p.y) };
            }
            if (Array.isArray(p) && p.length >= 2) {
                return { x: Number(p[0]), y: Number(p[1]) };
            }
            return { x: 0, y: 0 };
        });
    }

    return [];
}
