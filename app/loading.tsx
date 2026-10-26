export default function RootLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
      <p className="text-sm text-stone-500">Loading…</p>
    </div>
  );
}
