/**
 * @repo/db - Database access layer for the Sketch monorepo
 *
 * This package provides:
 * - Prisma client singleton
 * - Repository pattern for type-safe database access
 * - Clean separation between Prisma models and domain types
 */

// Prisma client (for advanced use cases only)
export { prisma } from "./client";

// Repository layer (preferred API)
export { drawingRepository, roomRepository } from "./repositories";
export type { RoomEntity } from "./repositories";

// Legacy default export for backward compatibility
import { prisma } from "./client";
export default prisma;
