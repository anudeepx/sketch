"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { X } from "lucide-react";

interface RoomCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  isLoading?: boolean;
}

/**
 * Modal for creating a new room.
 */
export function RoomCreationModal({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
}: RoomCreationModalProps) {
  const [roomName, setRoomName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim()) {
      onCreate(roomName.trim());
      setRoomName("");
    }
  };

  const handleClose = () => {
    setRoomName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md relative border border-zinc-700">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Create New Room</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="roomName" className="text-zinc-300">
              Room Name
            </Label>
            <Input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="mt-1 bg-zinc-700 border-zinc-600 text-white"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!roomName.trim() || isLoading}>
              {isLoading ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
