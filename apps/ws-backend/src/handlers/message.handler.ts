import type { ClientSocket } from "../types/server.types";
import { RoomService } from "../services/room.service";
import { BroadcastService } from "../services/broadcast.service";
import { drawingRepository } from "@repo/db/repositories";
import {
    ClientMessageSchema,
    WebSocketMessageType,
} from "@repo/shared/schemas";
import type { Drawing, CreateDrawingData } from "@repo/shared/types";
import { generateClientId } from "../utils/id";

/**
 * Handles all WebSocket message processing.
 */
export class MessageHandler {
    constructor(
        private readonly roomService: RoomService,
        private readonly broadcast: BroadcastService
    ) { }

    /**
     * Process an incoming message from a client.
     */
    async handle(client: ClientSocket, rawMessage: Buffer): Promise<void> {
        let parsed: unknown;

        try {
            parsed = JSON.parse(rawMessage.toString());
        } catch {
            this.sendError(client, "Invalid JSON format");
            return;
        }

        const result = ClientMessageSchema.safeParse(parsed);

        if (!result.success) {
            console.warn(`[Message] Invalid message from ${client.clientId}:`, result.error.flatten());
            this.sendError(client, "Invalid message format");
            return;
        }

        const message = result.data;

        switch (message.type) {
            case WebSocketMessageType.JOIN_ROOM:
                await this.handleJoinRoom(client, message.room);
                break;

            case WebSocketMessageType.LEAVE_ROOM:
                this.roomService.leaveRoom(client);
                break;

            case WebSocketMessageType.DRAWING:
                await this.handleDrawing(client, message.room, message.drawingData);
                break;

            case WebSocketMessageType.CLEAR_CANVAS:
                await this.handleClearCanvas(client, message.room);
                break;

            case WebSocketMessageType.PING:
                this.handlePing(client);
                break;
        }
    }

    private async handleJoinRoom(client: ClientSocket, roomId: string): Promise<void> {
        try {
            await this.roomService.joinRoom(client, roomId);
        } catch (error) {
            console.error(`[Message] Error joining room ${roomId}:`, error);
            this.sendError(client, "Failed to join room");
        }
    }

    private async handleDrawing(client: ClientSocket, roomId: string, drawing: Drawing): Promise<void> {
        const room = this.roomService.getRoom(client);

        if (!room || client.roomId !== roomId) {
            this.sendError(client, "Not in the specified room");
            return;
        }

        // Enhance drawing with metadata
        const enhancedDrawing: Drawing = {
            ...drawing,
            id: generateClientId(),
            timestamp: Date.now(),
            clientId: client.clientId,
        };

        // Update in-memory state
        room.drawings.push(enhancedDrawing);
        this.roomService.touchRoom(roomId);

        // Persist to database asynchronously
        this.persistDrawing(roomId, enhancedDrawing).catch((error) => {
            console.error(`[Message] Failed to persist drawing:`, error);
        });

        // Broadcast to other clients
        this.broadcast.toRoom(
            roomId,
            {
                type: WebSocketMessageType.DRAWING_BROADCAST,
                drawingData: enhancedDrawing,
            },
            client
        );

        console.log(`[Message] Drawing from ${client.clientId} in room ${roomId}`);
    }

    private async handleClearCanvas(client: ClientSocket, roomId: string): Promise<void> {
        if (client.roomId !== roomId) {
            this.sendError(client, "Not in the specified room");
            return;
        }

        try {
            await this.roomService.clearRoom(roomId);

            this.broadcast.toRoomAll(roomId, {
                type: WebSocketMessageType.CANVAS_CLEARED,
                clearedBy: client.clientId,
            });

            console.log(`[Message] Canvas cleared by ${client.clientId} in room ${roomId}`);
        } catch (error) {
            console.error(`[Message] Error clearing canvas:`, error);
            this.sendError(client, "Failed to clear canvas");
        }
    }

    private handlePing(client: ClientSocket): void {
        client.lastPing = Date.now();
        this.broadcast.toClient(client, {
            type: WebSocketMessageType.PONG,
            timestamp: Date.now(),
        });
    }

    private sendError(client: ClientSocket, message: string): void {
        this.broadcast.toClient(client, {
            type: WebSocketMessageType.ERROR,
            message,
        });
    }

    private async persistDrawing(roomId: string, drawing: Drawing): Promise<void> {
        const data = this.mapDrawingToCreateData(roomId, drawing);
        await drawingRepository.create(data);
    }

    private mapDrawingToCreateData(roomId: string, drawing: Drawing): CreateDrawingData {
        const base: CreateDrawingData = {
            roomId,
            type: drawing.type,
            color: drawing.color,
            size: 2,
        };

        switch (drawing.type) {
            case "pencil":
                return { ...base, points: drawing.points };

            case "rectangle":
                return {
                    ...base,
                    startX: drawing.startPoint.x,
                    startY: drawing.startPoint.y,
                    width: drawing.width,
                    height: drawing.height,
                };

            case "circle":
                return {
                    ...base,
                    centerX: drawing.center.x,
                    centerY: drawing.center.y,
                    radius: drawing.radius,
                };
        }
    }
}
