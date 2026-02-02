import { z } from "zod";
import { DrawingSchema } from "./drawing.schema";

/**
 * WebSocket message types as an enum for type safety
 */
export const WebSocketMessageType = {
    // Client -> Server
    JOIN_ROOM: "join_room",
    LEAVE_ROOM: "leave_room",
    DRAWING: "drawing",
    CLEAR_CANVAS: "clear_canvas",
    PING: "ping",

    // Server -> Client
    CONNECTED: "connected",
    INITIAL_DRAWINGS: "initial_drawings",
    DRAWING_BROADCAST: "drawing",
    CANVAS_CLEARED: "canvas_cleared",
    USER_JOINED: "user_joined",
    USER_LEFT: "user_left",
    PONG: "pong",
    ERROR: "error",
} as const;

export type WebSocketMessageTypeValue =
    (typeof WebSocketMessageType)[keyof typeof WebSocketMessageType];

/**
 * Client -> Server Messages
 */
export const JoinRoomMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.JOIN_ROOM),
    room: z.string().min(1),
});

export const LeaveRoomMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.LEAVE_ROOM),
    room: z.string().min(1),
});

export const DrawingMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.DRAWING),
    room: z.string().min(1),
    drawingData: DrawingSchema,
});

export const ClearCanvasMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.CLEAR_CANVAS),
    room: z.string().min(1),
});

export const PingMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.PING),
});

/**
 * Union of all client-to-server message types
 */
export const ClientMessageSchema = z.discriminatedUnion("type", [
    JoinRoomMessageSchema,
    LeaveRoomMessageSchema,
    DrawingMessageSchema,
    ClearCanvasMessageSchema,
    PingMessageSchema,
]);

/**
 * Server -> Client Messages
 */
export const ConnectedMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.CONNECTED),
    clientId: z.string(),
    timestamp: z.number(),
});

export const InitialDrawingsMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.INITIAL_DRAWINGS),
    data: z.array(DrawingSchema),
    roomId: z.string(),
    clientCount: z.number(),
});

export const DrawingBroadcastMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.DRAWING_BROADCAST),
    drawingData: DrawingSchema,
});

export const CanvasClearedMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.CANVAS_CLEARED),
    clearedBy: z.string(),
});

export const UserJoinedMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.USER_JOINED),
    clientId: z.string(),
    clientCount: z.number(),
});

export const UserLeftMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.USER_LEFT),
    clientId: z.string(),
    clientCount: z.number(),
});

export const PongMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.PONG),
    timestamp: z.number(),
});

export const ErrorMessageSchema = z.object({
    type: z.literal(WebSocketMessageType.ERROR),
    message: z.string(),
});

/**
 * Union of all server-to-client message types
 */
export const ServerMessageSchema = z.union([
    ConnectedMessageSchema,
    InitialDrawingsMessageSchema,
    DrawingBroadcastMessageSchema,
    CanvasClearedMessageSchema,
    UserJoinedMessageSchema,
    UserLeftMessageSchema,
    PongMessageSchema,
    ErrorMessageSchema,
]);
