import { prisma } from "../client";

/**
 * Room entity as returned from repository methods.
 */
export interface RoomEntity {
    id: string;
    name: string;
    createdAt: Date;
}

/**
 * Repository for room-related database operations.
 * Encapsulates all Prisma interactions for the Room model.
 */
export const roomRepository = {
    /**
     * Retrieve all rooms, ordered by creation time (newest first).
     */
    async findAll(): Promise<RoomEntity[]> {
        const rooms = await prisma.room.findMany({
            orderBy: { createdAt: "desc" },
        });

        return rooms.map((room) => ({
            id: room.id,
            name: room.name,
            createdAt: room.createdAt,
        }));
    },

    /**
     * Find a room by its ID.
     */
    async findById(id: string): Promise<RoomEntity | null> {
        const room = await prisma.room.findUnique({
            where: { id },
        });

        if (!room) return null;

        return {
            id: room.id,
            name: room.name,
            createdAt: room.createdAt,
        };
    },

    /**
     * Create a new room.
     */
    async create(name: string): Promise<RoomEntity> {
        const room = await prisma.room.create({
            data: { name },
        });

        return {
            id: room.id,
            name: room.name,
            createdAt: room.createdAt,
        };
    },

    /**
     * Delete a room and all associated drawings (cascade).
     */
    async delete(id: string): Promise<boolean> {
        try {
            await prisma.room.delete({
                where: { id },
            });
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Check if a room exists.
     */
    async exists(id: string): Promise<boolean> {
        const count = await prisma.room.count({
            where: { id },
        });
        return count > 0;
    },
};
