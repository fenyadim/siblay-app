export default function AdminOrdersLoading() {
  return (
    <div>
      <div className="h-9 w-32 rounded-lg bg-[var(--border)] animate-pulse mb-6" />

      {/* Status filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-lg bg-[var(--border)] animate-pulse" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]">
          {["ID", "Дата", "Клиент", "Материал", "Статус", ""].map((h) => (
            <div key={h} className="h-3 w-16 rounded bg-[var(--border)] animate-pulse" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 px-4 py-4 border-b border-[var(--border)] last:border-0">
            <div className="h-4 w-16 rounded bg-[var(--border)] animate-pulse" />
            <div className="h-4 w-24 rounded bg-[var(--border)] animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 w-32 rounded bg-[var(--border)] animate-pulse" />
              <div className="h-3 w-24 rounded bg-[var(--border)] animate-pulse" />
            </div>
            <div className="h-4 w-12 rounded bg-[var(--border)] animate-pulse" />
            <div className="h-5 w-16 rounded-full bg-[var(--border)] animate-pulse" />
            <div className="h-4 w-16 rounded bg-[var(--border)] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
