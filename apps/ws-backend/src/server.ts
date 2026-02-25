import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";;
import type { RoomsMap } from "./types/server.types";
import { BroadcastService, RoomService } from "./services";
import { ConnectionHandler } from "./handlers";
import { drawingRepository } from "@repo/db/repositories";
import { config, SERVER_CONFIG } from "./config";
import { prisma } from "@repo/db";

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

/**
 * Initialize and start the WebSocket server.
 */
async function main(): Promise<void> {
    const app = express();
    const server = createServer(app);

    // Shared state
    const rooms: RoomsMap = new Map();

    // Initialize services
    const broadcastService = new BroadcastService(rooms);
    const roomService = new RoomService(rooms, broadcastService);

    // Initialize WebSocket handler
    const connectionHandler = new ConnectionHandler(server, rooms, roomService, broadcastService);

    // Periodic cleanup of inactive rooms
    const cleanupInterval = setInterval(() => {
        roomService.cleanupInactiveRooms();
    }, SERVER_CONFIG.ROOM_CLEANUP_INTERVAL);

    // REST API setup
    app.use(express.json());

    // Health check endpoint
    app.get("/", (_req: Request, res: Response) => {
        const stats = roomService.getStats();
        res.json({
            status: "OK",
            message: "WebSocket drawing server is running",
            rooms: stats.roomCount,
            connections: stats.totalConnections,
            timestamp: new Date().toISOString(),
        });
    });

    // Room info endpoint
    app.get("/room/:roomId", (req: Request, res: Response) => {
        const { roomId } = req.params;

        if (!roomId) {
            res.status(400).json({ error: "Room ID required" });
            return;
        }

        const room = rooms.get(roomId);

        if (!room) {
            res.status(404).json({ error: "Room not found" });
            return;
        }

        res.json({
            roomId,
            clientCount: room.clients.size,
            drawingCount: room.drawings.length,
            lastActivity: room.lastActivity,
        });
    });

    // Clear drawings endpoint
    app.delete("/api/drawings", async (req: Request, res: Response) => {
        const roomId = req.query.roomId;

        if (!roomId || typeof roomId !== "string") {
            res.status(400).json({ error: "Room ID required" });
            return;
        }

        try {
            await roomService.clearRoom(roomId);
            res.json({ success: true, message: "Drawings cleared" });
        } catch (error) {
            console.error("[API] Error clearing drawings:", error);
            res.status(500).json({ error: "Failed to clear drawings" });
        }
    });

    // Error handling middleware
    app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error("[API] Express error:", error);
        res.status(500).json({ error: "Internal server error" });
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
        console.log(`\n[Server] ${signal} received, shutting down gracefully...`);

        clearInterval(cleanupInterval);
        await connectionHandler.close();

        server.close(async () => {
            console.log("[Server] HTTP server closed");
            await prisma.$disconnect();
            console.log("[Server] Database connection closed");
            process.exit(0);
        });

        // Force exit after 10 seconds
        setTimeout(() => {
            console.error("[Server] Forced shutdown after timeout");
            process.exit(1);
        }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Start server
    server.listen(config.PORT, () => {
        console.log(`[Server] WebSocket server running on port ${config.PORT}`);
        console.log(`[Server] Health check: http://localhost:${config.PORT}`);
        console.log(`[Server] Environment: ${config.NODE_ENV}`);
    });
}

main().catch((error) => {
    console.error("[Server] Failed to start:", error);
    process.exit(1);
});
