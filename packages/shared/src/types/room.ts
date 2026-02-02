import { z } from "zod";
import {
    CreateRoomSchema,
    RoomSchema,
    RoomListResponseSchema,
    CreateRoomResponseSchema,
} from "../schemas/room.schema";

/**
 * Room creation request payload
 */
export type CreateRoomRequest = z.infer<typeof CreateRoomSchema>;

/**
 * Room entity
 */
export type Room = z.infer<typeof RoomSchema>;

/**
 * Room list API response
 */
export type RoomListResponse = z.infer<typeof RoomListResponseSchema>;

/**
 * Room creation API response
 */
export type CreateRoomResponse = z.infer<typeof CreateRoomResponseSchema>;
