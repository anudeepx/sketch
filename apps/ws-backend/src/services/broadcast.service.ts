import WebSocket from "ws";
import type { ClientSocket, RoomState, RoomsMap } from "../types/server.types";
import type { ServerMessage } from "@repo/shared/types";

/**
 * Service for managing WebSocket message broadcasting.
 */
export class BroadcastService {
    constructor(private readonly rooms: RoomsMap) { }

    /**
     * Broadcast a message to all clients in a room except the sender.
     */
    toRoom(roomId: string, message: ServerMessage, excludeClient?: ClientSocket): void {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const payload = JSON.stringify(message);

        room.clients.forEach((client) => {
            if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
                this.safeSend(client, payload, room);
            }
        });
    }

    /**
     * Broadcast a message to ALL clients in a room including sender.
     */
    toRoomAll(roomId: string, message: ServerMessage): void {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const payload = JSON.stringify(message);

        room.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                this.safeSend(client, payload, room);
            }
        });
    }

    /**
     * Send a message to a specific client.
     */
    toClient(client: ClientSocket, message: ServerMessage): boolean {
        if (client.readyState !== WebSocket.OPEN) {
            return false;
        }

        try {
            client.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error(`[Broadcast] Error sending to client ${client.clientId}:`, error);
            return false;
        }
    }

    /**
     * Safely send a message, removing client from room on error.
     */
    private safeSend(client: ClientSocket, payload: string, room: RoomState): void {
        try {
            client.send(payload);
        } catch (error) {
            console.error(`[Broadcast] Error sending to client ${client.clientId}:`, error);
            room.clients.delete(client);
        }
    }
}
