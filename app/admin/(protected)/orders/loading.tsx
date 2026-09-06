export default function AdminOrdersLoading() {
  return (
    <div>
      <div className="h-9 w-32 rounded-lg bg-border animate-pulse mb-6" />

      {/* Status filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-lg bg-border animate-pulse" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-3 lg:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-border bg-surface p-4 animate-pulse"
          >
            <div className="h-4 w-1/2 rounded bg-border" />
            <div className="h-5 w-3/4 rounded bg-border" />
            <div className="h-12 rounded bg-border" />
            <div className="h-11 rounded bg-border" />
          </div>
        ))}
      </div>
      <div className="hidden lg:block rounded-xl border border-border bg-surface overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-border bg-background">
          {['Дата', 'Клиент', 'Описание заказа', 'Статус', 'Сумма', ''].map((h) => (
            <div key={h} className="h-3 w-16 rounded bg-border animate-pulse" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-6 gap-4 px-4 py-4 border-b border-border last:border-0"
          >
            <div className="h-4 w-16 rounded bg-border animate-pulse" />
            <div className="h-4 w-24 rounded bg-border animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 w-32 rounded bg-border animate-pulse" />
              <div className="h-3 w-24 rounded bg-border animate-pulse" />
            </div>
            <div className="h-4 w-12 rounded bg-border animate-pulse" />
            <div className="h-5 w-16 rounded-full bg-border animate-pulse" />
            <div className="h-4 w-16 rounded bg-border animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
