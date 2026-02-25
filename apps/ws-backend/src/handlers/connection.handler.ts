import WebSocket, { WebSocketServer } from "ws";
import type { Server } from "http";
import { RoomService } from "../services/room.service";
import { BroadcastService } from "../services/broadcast.service";
import { MessageHandler } from "./message.handler";
import { WebSocketMessageType } from "@repo/shared/schemas";
import { generateClientId } from "../utils/id";
import { SERVER_CONFIG } from "../config";
import type { RoomsMap, ClientSocket } from "../types/server.types";

/**
 * Handles WebSocket connection lifecycle.
 */
export class ConnectionHandler {
    private readonly wss: WebSocketServer;
    private readonly messageHandler: MessageHandler;
    private readonly pingInterval: NodeJS.Timeout;

    constructor(
        server: Server,
        private readonly rooms: RoomsMap,
        private readonly roomService: RoomService,
        private readonly broadcast: BroadcastService
    ) {
        this.wss = new WebSocketServer({
            server,
            perMessageDeflate: false,
        });

        this.messageHandler = new MessageHandler(roomService, broadcast);
        this.pingInterval = this.setupPingInterval();

        this.wss.on("connection", this.handleConnection.bind(this));
    }

    /**
     * Handle new WebSocket connection.
     */
    private handleConnection(ws: WebSocket): void {
        const client = ws as ClientSocket;
        client.clientId = generateClientId();
        client.lastPing = Date.now();
        client.isAlive = true;

        console.log(`[Connection] New client: ${client.clientId}`);

        // Send welcome message
        this.broadcast.toClient(client, {
            type: WebSocketMessageType.CONNECTED,
            clientId: client.clientId,
            timestamp: Date.now(),
        });

        // Set up event handlers
        client.on("message", async (message: Buffer) => {
            try {
                await this.messageHandler.handle(client, message);
            } catch (error) {
                console.error(`[Connection] Error handling message:`, error);
                this.broadcast.toClient(client, {
                    type: WebSocketMessageType.ERROR,
                    message: "Internal server error",
                });
            }
        });

        client.on("close", (code, reason) => {
            console.log(`[Connection] Client ${client.clientId} disconnected: ${code} ${reason.toString()}`);
            this.roomService.leaveRoom(client);
        });

        client.on("error", (error) => {
            console.error(`[Connection] Error for client ${client.clientId}:`, error);
        });

        client.on("pong", () => {
            client.isAlive = true;
            client.lastPing = Date.now();
        });
    }

    /**
     * Set up periodic ping to detect dead connections.
     */
    private setupPingInterval(): NodeJS.Timeout {
        return setInterval(() => {
            this.wss.clients.forEach((ws) => {
                const client = ws as ClientSocket;

                if (!client.isAlive) {
                    console.log(`[Connection] Terminating unresponsive client: ${client.clientId}`);
                    this.roomService.leaveRoom(client);
                    return client.terminate();
                }

                client.isAlive = false;
                client.ping();
            });
        }, SERVER_CONFIG.PING_INTERVAL);
    }

    /**
     * Graceful shutdown.
     */
    close(): Promise<void> {
        return new Promise((resolve) => {
            clearInterval(this.pingInterval);

            this.wss.clients.forEach((ws) => {
                ws.close(1001, "Server shutting down");
            });

            this.wss.close(() => {
                resolve();
            });
        });
    }
}
