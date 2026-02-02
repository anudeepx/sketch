"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
    ConnectionStatus,
    WebSocketConfig,
    ClientMessage,
    ServerMessage,
} from "@repo/shared/types";
import { ServerMessageSchema, WebSocketMessageType } from "@repo/shared/schemas";

interface UseWebSocketOptions extends WebSocketConfig {
    onMessage?: (message: ServerMessage) => void;
    onError?: (error: Event) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

const DEFAULT_RECONNECT_ATTEMPTS = 5;
const DEFAULT_RECONNECT_DELAY = 3000;

/**
 * WebSocket hook for real-time communication.
 * Handles connection lifecycle, reconnection, and message parsing.
 */
export function useWebSocket({
    url,
    roomId,
    onMessage,
    onError,
    onConnect,
    onDisconnect,
    reconnectAttempts = DEFAULT_RECONNECT_ATTEMPTS,
    reconnectDelay = DEFAULT_RECONNECT_DELAY,
}: UseWebSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectCountRef = useRef(0);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");

    /**
     * Clean up WebSocket and timeout.
     */
    const cleanup = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.onopen = null;
            wsRef.current.onclose = null;
            wsRef.current.onmessage = null;
            wsRef.current.onerror = null;

            if (wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close(1000, "Component cleanup");
            }

            wsRef.current = null;
        }
    }, []);

    /**
     * Connect to WebSocket server.
     */
    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        cleanup();
        setConnectionStatus("connecting");

        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("[WebSocket] Connected");
                setConnectionStatus("connected");
                reconnectCountRef.current = 0;
                onConnect?.();

                // Join room immediately
                ws.send(JSON.stringify({ type: WebSocketMessageType.JOIN_ROOM, room: roomId }));
            };

            ws.onmessage = (event) => {
                try {
                    const raw = JSON.parse(event.data);
                    const result = ServerMessageSchema.safeParse(raw);

                    if (result.success) {
                        onMessage?.(result.data);
                    } else {
                        console.warn("[WebSocket] Invalid message format:", result.error);
                    }
                } catch (error) {
                    console.error("[WebSocket] Failed to parse message:", error);
                }
            };

            ws.onclose = (event) => {
                console.log(`[WebSocket] Closed: ${event.code} ${event.reason}`);
                setConnectionStatus("disconnected");
                onDisconnect?.();

                // Attempt reconnection for abnormal closures
                if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
                    reconnectCountRef.current++;
                    const delay = reconnectDelay * reconnectCountRef.current;

                    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectCountRef.current}/${reconnectAttempts})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, delay);
                } else if (reconnectCountRef.current >= reconnectAttempts) {
                    setConnectionStatus("error");
                }
            };

            ws.onerror = (error) => {
                console.error("[WebSocket] Error:", error);
                setConnectionStatus("error");
                onError?.(error);
            };
        } catch (error) {
            console.error("[WebSocket] Failed to create connection:", error);
            setConnectionStatus("error");
        }
    }, [url, roomId, onMessage, onError, onConnect, onDisconnect, reconnectAttempts, reconnectDelay, cleanup]);

    /**
     * Send a message through WebSocket.
     */
    const sendMessage = useCallback((message: ClientMessage): boolean => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
            console.warn("[WebSocket] Cannot send - not connected");
            return false;
        }

        try {
            wsRef.current.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error("[WebSocket] Send error:", error);
            return false;
        }
    }, []);

    /**
     * Disconnect from WebSocket.
     */
    const disconnect = useCallback(() => {
        cleanup();
        setConnectionStatus("disconnected");
    }, [cleanup]);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {
        connect,
        disconnect,
        sendMessage,
        connectionStatus,
        isConnected: connectionStatus === "connected",
    };
}
