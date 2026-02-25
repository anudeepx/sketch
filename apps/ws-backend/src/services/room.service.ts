import { ClientSocket, RoomState, RoomsMap } from "../types/server.types";
import { BroadcastService } from "./broadcast.service";
import { drawingRepository } from "@repo/db/repositories";
import { WebSocketMessageType } from "@repo/shared/schemas";
import { SERVER_CONFIG } from "../config";

/**
 * Service for managing room lifecycle and state.
 */
export class RoomService {
    private cleanupTimers = new Map<string, NodeJS.Timeout>();

    constructor(
        private readonly rooms: RoomsMap,
        private readonly broadcast: BroadcastService
    ) { }

    /**
     * Add a client to a room, creating the room if it doesn't exist.
     * Returns the initial drawings to send to the client.
     */
    async joinRoom(client: ClientSocket, roomId: string): Promise<void> {
        // Cancel any pending cleanup for this room
        this.cancelCleanup(roomId);

        // Initialize room if needed
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
                clients: new Set(),
                drawings: [],
                lastActivity: Date.now(),
            });
        }

        const room = this.rooms.get(roomId)!;
        room.clients.add(client);
        room.lastActivity = Date.now();
        client.roomId = roomId;

        // Fetch drawings from database
        const drawings = await drawingRepository.findByRoomId(roomId);
        room.drawings = drawings;

        // Send initial state to joining client
        this.broadcast.toClient(client, {
            type: WebSocketMessageType.INITIAL_DRAWINGS,
            data: drawings,
            roomId,
            clientCount: room.clients.size,
        });

        // Notify other clients
        this.broadcast.toRoom(
            roomId,
            {
                type: WebSocketMessageType.USER_JOINED,
                clientId: client.clientId,
                clientCount: room.clients.size,
            },
            client
        );

        console.log(`[Room] Client ${client.clientId} joined room ${roomId} (${room.clients.size} clients)`);
    }

    /**
     * Remove a client from their current room.
     */
    leaveRoom(client: ClientSocket): void {
        const roomId = client.roomId;
        if (!roomId) return;

        const room = this.rooms.get(roomId);
        if (!room) return;

        room.clients.delete(client);
        client.roomId = undefined;

        // Notify remaining clients
        this.broadcast.toRoom(roomId, {
            type: WebSocketMessageType.USER_LEFT,
            clientId: client.clientId,
            clientCount: room.clients.size,
        });

        console.log(`[Room] Client ${client.clientId} left room ${roomId} (${room.clients.size} clients)`);

        // Schedule cleanup if room is empty
        if (room.clients.size === 0) {
            this.scheduleCleanup(roomId);
        }
    }

    /**
     * Get the current room state for a client.
     */
    getRoom(client: ClientSocket): RoomState | undefined {
        if (!client.roomId) return undefined;
        return this.rooms.get(client.roomId);
    }

    /**
     * Update last activity timestamp for a room.
     */
    touchRoom(roomId: string): void {
        const room = this.rooms.get(roomId);
        if (room) {
            room.lastActivity = Date.now();
        }
    }

    /**
     * Clear all drawings from a room.
     */
    async clearRoom(roomId: string): Promise<void> {
        const room = this.rooms.get(roomId);
        if (room) {
            room.drawings = [];
            room.lastActivity = Date.now();
        }

        await drawingRepository.deleteByRoomId(roomId);
    }

    /**
     * Clean up inactive rooms.
     */
    cleanupInactiveRooms(): void {
        const now = Date.now();

        this.rooms.forEach((room, roomId) => {
            if (room.clients.size === 0 && now - room.lastActivity > SERVER_CONFIG.ROOM_INACTIVE_TIMEOUT) {
                console.log(`[Room] Cleaning up inactive room: ${roomId}`);
                this.rooms.delete(roomId);
            }
        });
    }

    /**
     * Get room statistics for health check.
     */
    getStats(): { roomCount: number; totalConnections: number } {
        let totalConnections = 0;
        this.rooms.forEach((room) => {
            totalConnections += room.clients.size;
        });

        return {
            roomCount: this.rooms.size,
            totalConnections,
        };
    }

    private scheduleCleanup(roomId: string): void {
        const timer = setTimeout(() => {
            const room = this.rooms.get(roomId);
            if (room && room.clients.size === 0) {
                console.log(`[Room] Cleaning up empty room: ${roomId}`);
                this.rooms.delete(roomId);
                this.cleanupTimers.delete(roomId);
            }
        }, SERVER_CONFIG.ROOM_CLEANUP_DELAY);

        this.cleanupTimers.set(roomId, timer);
    }

    private cancelCleanup(roomId: string): void {
        const timer = this.cleanupTimers.get(roomId);
        if (timer) {
            clearTimeout(timer);
            this.cleanupTimers.delete(roomId);
        }
    }
}
