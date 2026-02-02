import { z } from "zod";

/**
 * Room creation request schema
 */
export const CreateRoomSchema = z.object({
    roomName: z
        .string()
        .min(1, "Room name is required")
        .max(100, "Room name must be 100 characters or less")
        .trim(),
});

/**
 * Room response schema
 */
export const RoomSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.coerce.date(),
});

/**
 * Room list response schema
 */
export const RoomListResponseSchema = z.object({
    rooms: z.array(RoomSchema),
});

/**
 * Room creation response schema
 */
export const CreateRoomResponseSchema = z.object({
    id: z.string().uuid(),
});
