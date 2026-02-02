import WebSocket from "ws";
import type { Drawing } from "@repo/shared/types";

/**
 * Extended WebSocket with room association and metadata
 */
export interface ClientSocket extends WebSocket {
    /** Unique client identifier */
    clientId: string;
    /** Room the client is currently in */
    roomId?: string;
    /** Last ping timestamp for connection health monitoring */
    lastPing: number;
    /** Whether the socket is still alive (for ping/pong) */
    isAlive: boolean;
}

/**
 * Room state maintained in memory
 */
export interface RoomState {
    /** Connected clients in this room */
    clients: Set<ClientSocket>;
    /** In-memory drawing cache (subset of DB) */
    drawings: Drawing[];
    /** Last activity timestamp for cleanup */
    lastActivity: number;
}

/**
 * Rooms collection indexed by room ID
 */
export type RoomsMap = Map<string, RoomState>;
