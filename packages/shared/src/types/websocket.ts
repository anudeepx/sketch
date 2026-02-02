import { z } from "zod";
import {
    ClientMessageSchema,
    ServerMessageSchema,
    JoinRoomMessageSchema,
    DrawingMessageSchema,
    ClearCanvasMessageSchema,
    InitialDrawingsMessageSchema,
    DrawingBroadcastMessageSchema,
    CanvasClearedMessageSchema,
    UserJoinedMessageSchema,
    UserLeftMessageSchema,
    ErrorMessageSchema,
    ConnectedMessageSchema,
} from "../schemas/websocket.schema";

/**
 * Client-to-server message types
 */
export type ClientMessage = z.infer<typeof ClientMessageSchema>;
export type JoinRoomMessage = z.infer<typeof JoinRoomMessageSchema>;
export type DrawingMessage = z.infer<typeof DrawingMessageSchema>;
export type ClearCanvasMessage = z.infer<typeof ClearCanvasMessageSchema>;

/**
 * Server-to-client message types
 */
export type ServerMessage = z.infer<typeof ServerMessageSchema>;
export type ConnectedMessage = z.infer<typeof ConnectedMessageSchema>;
export type InitialDrawingsMessage = z.infer<typeof InitialDrawingsMessageSchema>;
export type DrawingBroadcastMessage = z.infer<typeof DrawingBroadcastMessageSchema>;
export type CanvasClearedMessage = z.infer<typeof CanvasClearedMessageSchema>;
export type UserJoinedMessage = z.infer<typeof UserJoinedMessageSchema>;
export type UserLeftMessage = z.infer<typeof UserLeftMessageSchema>;
export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;

/**
 * WebSocket connection status
 */
export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

/**
 * Configuration for WebSocket connection
 */
export interface WebSocketConfig {
    url: string;
    roomId: string;
    reconnectAttempts?: number;
    reconnectDelay?: number;
}
