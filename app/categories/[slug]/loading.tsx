export default function CategoryLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading category">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-stone-200" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-stone-100 bg-white">
            <div className="aspect-square animate-pulse bg-stone-200" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
