import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/card";
import type { Room } from "@repo/shared/types";

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

/**
 * Card component for displaying a room in the room list.
 */
export function RoomCard({ room, onJoin }: RoomCardProps) {
  const formattedDate = new Date(room.createdAt).toLocaleDateString();

  return (
    <Card
      className="bg-zinc-700 hover:bg-zinc-600 transition-colors cursor-pointer border-zinc-600"
      onClick={() => onJoin(room.id)}
    >
      <CardHeader>
        <CardTitle className="text-lg font-semibold truncate">{room.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-400">Created: {formattedDate}</p>
      </CardContent>
    </Card>
  );
}
