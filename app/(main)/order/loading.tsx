export default function OrderLoading() {
  return (
    <div className="min-h-screen bg-background py-8 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-3 w-24 rounded bg-border animate-pulse mb-2" />
          <div className="h-10 w-48 rounded-lg bg-border animate-pulse" />
        </div>

        {/* Stepper */}
        <div className="mb-8 p-5 rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-border animate-pulse" />
                  <div className="h-3 w-14 rounded bg-border animate-pulse" />
                </div>
                {i < 5 && <div className="flex-1 h-px mx-3 bg-border animate-pulse" />}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Step content */}
          <div className="rounded-2xl border border-border bg-surface p-6 lg:p-8">
            <div className="h-8 w-56 rounded-lg bg-border animate-pulse mb-2" />
            <div className="h-4 w-80 rounded bg-border animate-pulse mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl border-2 border-border bg-border animate-pulse" />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
              <div className="h-5 w-24 rounded bg-border animate-pulse" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-16 rounded bg-border animate-pulse" />
                  <div className="h-4 w-28 rounded bg-border animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
