"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { RoomCard, RoomCreationModal } from "@/features/rooms";
import type { Room, RoomListResponse, CreateRoomResponse } from "@repo/shared/types";

async function fetchRooms(): Promise<Room[]> {
  const response = await fetch("/api/rooms");
  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }
  const data: RoomListResponse = await response.json();
  return data.rooms;
}

async function createRoom(name: string): Promise<string> {
  const response = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomName: name }),
  });

  if (!response.ok) {
    throw new Error("Failed to create room");
  }

  const data: CreateRoomResponse = await response.json();
  return data.id;
}

export default function JoinRoomPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const loadRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchRooms();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleJoinRoom = useCallback(
    (roomId: string) => {
      router.push(`/canvas?roomid=${encodeURIComponent(roomId)}`);
    },
    [router]
  );

  const handleCreateRoom = useCallback(async (name: string) => {
    try {
      setIsCreating(true);
      const id = await createRoom(name);

      setRooms((prev) => [
        { id, name, createdAt: new Date() },
        ...prev,
      ]);

      toast.success("Room created successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white p-4">
      <Card className="w-full max-w-4xl bg-zinc-800 border-zinc-700">
        <CardHeader className="border-b border-zinc-700">
          <CardTitle className="text-2xl font-bold text-center">
            Available Rooms
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              No rooms available. Create your first room!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} onJoin={handleJoinRoom} />
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Button
              className="bg-yellow-200 hover:bg-yellow-300 text-zinc-900 font-medium px-6 py-3 rounded-lg transition-colors"
              onClick={() => setShowModal(true)}
            >
              Create New Room
            </Button>
          </div>
        </CardContent>
      </Card>

      <RoomCreationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateRoom}
        isLoading={isCreating}
      />
    </div>
  );
}

