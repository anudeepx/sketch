/**
 * Loading state for canvas page.
 */
export default function CanvasLoading() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#18181b]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
        <p className="text-zinc-400 text-sm">Loading canvas...</p>
      </div>
    </div>
  );
}
