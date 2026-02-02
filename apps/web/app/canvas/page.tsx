"use client";

import { Suspense } from "react";
import { useSearchParams, redirect } from "next/navigation";
import { CanvasView } from "@/features/canvas/components/canvas-view";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

function CanvasContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams?.get("roomid");

  if (!roomId) {
    redirect("/join");
  }

  return <CanvasView roomId={roomId} wsUrl={WS_URL} />;
}

function CanvasLoading() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#18181b]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
    </div>
  );
}

export default function CanvasPage() {
  return (
    <Suspense fallback={<CanvasLoading />}>
      <CanvasContent />
    </Suspense>
  );
}
