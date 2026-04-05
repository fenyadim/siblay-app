import { cn } from "@/lib/utils"

const STEPS = [
  { num: 1, label: "Материал" },
  { num: 2, label: "Цвет" },
  { num: 3, label: "Параметры" },
  { num: 4, label: "Файлы" },
  { num: 5, label: "Комментарий" },
  { num: 6, label: "Контакты" },
]

interface OrderStepperProps {
  current: number
}

export function OrderStepper({ current }: OrderStepperProps) {
  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between">
        {STEPS.map((step, i) => {
          const done = step.num < current
          const active = step.num === current
          return (
            <div key={step.num} className="flex-1 flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors shrink-0",
                    done && "bg-[var(--accent)] text-white",
                    active && "bg-[var(--accent)] text-white ring-4 ring-[var(--accent-subtle)]",
                    !done && !active && "border-2 border-[var(--border)] text-[var(--muted)] bg-[var(--surface)]",
                  )}
                >
                  {done ? (
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="font-mono text-xs">{step.num}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    active ? "text-[var(--accent)]" : "text-[var(--muted)]",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px mx-3 transition-colors",
                    done ? "bg-[var(--accent)]" : "bg-[var(--border)]",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile */}
      <div className="sm:hidden flex items-center gap-3">
        <div className="flex gap-1.5">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className={cn(
                "h-1.5 rounded-full transition-all",
                step.num < current && "bg-[var(--accent)] w-4",
                step.num === current && "bg-[var(--accent)] w-8",
                step.num > current && "bg-[var(--border)] w-4",
              )}
            />
          ))}
        </div>
        <span className="text-sm text-[var(--muted)]">
          <span className="font-mono font-medium text-[var(--foreground)]">{current}</span>
          <span className="mx-1">/</span>
          {STEPS.length}
          <span className="ml-2 text-[var(--accent)]">— {STEPS[current - 1]?.label}</span>
        </span>
      </div>
    </div>
  )
}
