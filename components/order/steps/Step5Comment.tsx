"use client"

import { useFormContext } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import type { OrderFormData } from "@/lib/validations/order"

const HINTS = [
  "Допуски на размеры (например: ±0.2 мм)",
  "Назначение изделия (прототип, рабочая деталь, декор)",
  "Требования к поверхности (шлифовка, хим. разглаживание)",
  "Наличие резьбы, вставок, посадочных мест",
  "Особые условия эксплуатации (температура, влага, нагрузки)",
]

export function Step5Comment() {
  const { register, watch } = useFormContext<OrderFormData>()
  const comment = watch("comment") ?? ""

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-foreground mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
          Комментарии к заказу
        </h2>
        <p className="text-sm text-muted">Необязательный шаг — пропустите, если нет особых требований</p>
      </div>

      <div className="relative">
        <Textarea
          {...register("comment")}
          rows={6}
          placeholder="Опишите особые требования: допуски, цель использования, пожелания по качеству поверхности..."
          className="bg-background border-border text-foreground placeholder:text-(--placeholder) focus-visible:ring-0 focus-visible:border-accent resize-none transition-colors"
        />
        <div className="absolute bottom-3 right-3">
          <span className={cn(
            "text-xs font-mono",
            comment.length > 1800 ? "text-(--warning)" : "text-muted"
          )}>
            {comment.length} / 2000
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold text-foreground mb-3">Что полезно указать:</p>
        <ul className="space-y-2">
          {HINTS.map((hint) => (
            <li key={hint} className="flex items-start gap-2 text-xs text-muted">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              {hint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
