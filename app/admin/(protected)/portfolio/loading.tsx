export default function AdminPortfolioLoading() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="h-9 w-36 rounded-lg bg-border animate-pulse" />
        <div className="h-9 w-36 rounded-lg bg-border animate-pulse" />
      </div>

      <div className="space-y-3 lg:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-border bg-surface p-4 animate-pulse"
          >
            <div className="h-10 w-3/4 rounded bg-border" />
            <div className="h-4 w-1/2 rounded bg-border" />
            <div className="h-6 w-1/3 rounded bg-border" />
            <div className="h-11 rounded bg-border" />
          </div>
        ))}
      </div>
      <div className="hidden lg:block rounded-xl border border-border bg-surface overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-border bg-background">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 w-20 rounded bg-border animate-pulse" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-4 px-4 py-4 border-b border-border last:border-0"
          >
            <div className="h-4 w-32 rounded bg-border animate-pulse" />
            <div className="h-4 w-24 rounded bg-border animate-pulse" />
            <div className="h-4 w-16 rounded bg-border animate-pulse" />
            <div className="h-5 w-24 rounded-full bg-border animate-pulse" />
            <div className="flex gap-2">
              <div className="h-7 w-20 rounded-lg bg-border animate-pulse" />
              <div className="h-7 w-16 rounded-lg bg-border animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
