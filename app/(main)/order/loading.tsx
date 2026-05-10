export default function OrderLoading() {
  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="h-3 w-40 rounded bg-border animate-pulse" />
          <div className="mt-2 h-10 w-56 rounded-lg bg-border animate-pulse" />
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          {/* Main card */}
          <div className="rounded-2xl border border-border bg-surface overflow-hidden">
            {/* Stepper header */}
            <div className="px-6 lg:px-8 pt-6 pb-5 border-b border-border bg-surface-raised">
              <div className="w-full space-y-4">
                {/* Progress bar */}
                <div className="h-1 w-full rounded-full bg-border animate-pulse" />

                {/* Desktop steps */}
                <div className="hidden sm:flex items-start justify-between">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex-1 flex items-start">
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="w-7 h-7 rounded-full bg-border animate-pulse" />
                        <div className="h-3 w-14 rounded bg-border animate-pulse" />
                      </div>
                      {i < 5 && <div className="flex-1 h-px mt-3.5 mx-1 bg-border animate-pulse" />}
                    </div>
                  ))}
                </div>

                {/* Mobile */}
                <div className="sm:hidden flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-border animate-pulse shrink-0" />
                    <div className="space-y-1">
                      <div className="h-3 w-20 rounded bg-border animate-pulse" />
                      <div className="h-4 w-24 rounded bg-border animate-pulse" />
                    </div>
                  </div>
                  <div className="h-3 w-8 rounded bg-border animate-pulse" />
                </div>
              </div>
            </div>

            {/* Step content */}
            <div className="px-6 lg:px-8 py-8">
              <div className="h-7 w-48 rounded-lg bg-border animate-pulse mb-2" />
              <div className="h-4 w-64 max-w-full rounded bg-border animate-pulse mb-8" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-xl border-2 border-border bg-border animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Navigation footer */}
            <div className="px-6 lg:px-8 py-5 border-t border-border bg-surface-raised flex items-center justify-between gap-3">
              <div className="h-9 w-24 rounded-md bg-border animate-pulse" />
              <div className="sm:hidden flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full bg-border animate-pulse"
                    style={{ width: i === 0 ? 16 : 6, height: 6 }}
                  />
                ))}
              </div>
              <div className="h-9 w-28 rounded-md bg-border animate-pulse" />
            </div>
          </div>

          {/* Summary sidebar */}
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
