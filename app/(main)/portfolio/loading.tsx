export default function PortfolioLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-10">
          <div className="h-3 w-16 rounded bg-[var(--border)] animate-pulse mb-3" />
          <div className="h-10 w-48 rounded-lg bg-[var(--border)] animate-pulse mb-3" />
          <div className="h-4 w-80 rounded bg-[var(--border)] animate-pulse" />
        </div>

        {/* Filter skeleton */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-[var(--border)] animate-pulse" />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
              <div className="aspect-[4/3] bg-[var(--border)] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-20 rounded bg-[var(--border)] animate-pulse" />
                <div className="h-5 w-36 rounded bg-[var(--border)] animate-pulse" />
                <div className="h-3 w-full rounded bg-[var(--border)] animate-pulse" />
                <div className="h-3 w-2/3 rounded bg-[var(--border)] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
