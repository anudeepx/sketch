/**
 * Global loading component for route transitions.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400" />
        <p className="text-zinc-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
