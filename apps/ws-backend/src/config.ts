import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().default(8080),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

function loadConfig(): Env {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error("❌ Invalid environment variables:");
        console.error(parsed.error.flatten().fieldErrors);
        process.exit(1);
    }

    return parsed.data;
}

export const config = loadConfig();

/**
 * Server configuration constants
 */
export const SERVER_CONFIG = {
    /** Ping interval for WebSocket keep-alive (ms) */
    PING_INTERVAL: 30_000,
    /** Room cleanup delay after last client leaves (ms) */
    ROOM_CLEANUP_DELAY: 5_000,
    /** Inactive room timeout (ms) */
    ROOM_INACTIVE_TIMEOUT: 30 * 60 * 1000,
    /** Interval for checking inactive rooms (ms) */
    ROOM_CLEANUP_INTERVAL: 10 * 60 * 1000,
} as const;
