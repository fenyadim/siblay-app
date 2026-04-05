export default function AdminMaterialsLoading() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-9 w-36 rounded-lg bg-[var(--border)] animate-pulse mb-2" />
        <div className="h-4 w-72 rounded bg-[var(--border)] animate-pulse" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
              <div className="w-3 h-3 rounded-full bg-[var(--border)] animate-pulse" />
              <div className="h-6 w-16 rounded bg-[var(--border)] animate-pulse" />
              <div className="ml-auto h-6 w-20 rounded-full bg-[var(--border)] animate-pulse" />
            </div>
            <div className="px-5 py-3 grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-1.5">
                  <div className="h-3 w-16 rounded bg-[var(--border)] animate-pulse" />
                  <div className="h-4 w-24 rounded bg-[var(--border)] animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
