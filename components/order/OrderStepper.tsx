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
  const progress = ((current - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--accent), #7c3aed)",
          }}
        />
      </div>

      {/* Desktop steps */}
      <div className="hidden sm:flex items-start justify-between">
        {STEPS.map((step, i) => {
          const done = step.num < current
          const active = step.num === current
          return (
            <div key={step.num} className="flex-1 flex items-start">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0",
                    done && "bg-[var(--accent)] text-white shadow-sm",
                    active && "text-white shadow-md ring-4 ring-[var(--accent)]/20",
                    !done && !active && "border-2 border-[var(--border)] text-[var(--muted)] bg-[var(--surface)]",
                  )}
                  style={active ? { background: "linear-gradient(135deg, var(--accent), #7c3aed)" } : undefined}
                >
                  {done ? (
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="font-mono">{step.num}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium whitespace-nowrap text-center",
                    active ? "text-[var(--accent)]" : done ? "text-[var(--foreground)]" : "text-[var(--muted)]",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mt-3.5 mx-1 transition-colors duration-300"
                  style={{ background: done ? "var(--accent)" : "var(--border)" }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile */}
      <div className="sm:hidden flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, var(--accent), #7c3aed)" }}
          >
            {current}
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Шаг {current} из {STEPS.length}</p>
            <p className="text-sm font-semibold text-[var(--foreground)]">{STEPS[current - 1]?.label}</p>
          </div>
        </div>
        <span className="text-xs font-mono text-[var(--muted)]">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}
