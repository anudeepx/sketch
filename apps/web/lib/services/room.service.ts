import { roomRepository } from "@repo/db/repositories";
import type { Room, CreateRoomResponse, RoomListResponse } from "@repo/shared/types";

/**
 * Service layer for room-related business logic.
 * Separates API handlers from data access.
 */
export const roomService = {
    /**
     * Get all rooms for listing.
     */
    async listRooms(): Promise<RoomListResponse> {
        const entities = await roomRepository.findAll();

        const rooms: Room[] = entities.map((entity) => ({
            id: entity.id,
            name: entity.name,
            createdAt: entity.createdAt,
        }));

        return { rooms };
    },

    /**
     * Create a new room.
     */
    async createRoom(name: string): Promise<CreateRoomResponse> {
        const entity = await roomRepository.create(name);
        return { id: entity.id };
    },

    /**
     * Check if a room exists.
     */
    async roomExists(id: string): Promise<boolean> {
        return roomRepository.exists(id);
    },
};
