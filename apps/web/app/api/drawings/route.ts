import { NextRequest } from "next/server";
import { z } from "zod";
import { drawingService } from "@/lib/services";
import { handleRoute, successResponse, errorResponse } from "@/lib/api/response";

const DeleteQuerySchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
});

/**
 * DELETE /api/drawings?roomId=xxx
 * Clears all drawings for a specific room.
 */
export async function DELETE(req: NextRequest) {
  return handleRoute(async () => {
    const url = new URL(req.url);
    const roomId = url.searchParams.get("roomId");

    const result = DeleteQuerySchema.safeParse({ roomId });

    if (!result.success) {
      return errorResponse("Room ID is required", 400);
    }

    await drawingService.clearRoom(result.data.roomId);
    return successResponse({ message: "Canvas cleared successfully" });
  });
}
