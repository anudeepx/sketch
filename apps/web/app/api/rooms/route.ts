import { NextRequest } from "next/server";
import { CreateRoomSchema } from "@repo/shared/schemas";
import { roomService } from "@/lib/services";
import { handleRoute, successResponse, validationErrorResponse } from "@/lib/api/response";

/**
 * GET /api/rooms
 * Returns list of all available rooms.
 */
export async function GET() {
  return handleRoute(async () => {
    const data = await roomService.listRooms();
    return successResponse(data);
  });
}

/**
 * POST /api/rooms
 * Creates a new room.
 *
 * Body: { roomName: string }
 */
export async function POST(req: NextRequest) {
  return handleRoute(async () => {
    const body = await req.json();
    const result = CreateRoomSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const data = await roomService.createRoom(result.data.roomName);
    return successResponse(data, 201);
  });
}
