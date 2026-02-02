import { drawingRepository } from "@repo/db/repositories";

/**
 * Service layer for drawing-related business logic.
 */
export const drawingService = {
    /**
     * Clear all drawings for a room.
     */
    async clearRoom(roomId: string): Promise<{ deletedCount: number }> {
        const count = await drawingRepository.deleteByRoomId(roomId);
        return { deletedCount: count };
    },
};
