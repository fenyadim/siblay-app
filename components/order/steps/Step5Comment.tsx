"use client"

import { useFormContext } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import type { OrderFormData } from "@/lib/validations/order"

export function Step5Comment() {
  const { register, watch } = useFormContext<OrderFormData>()
  const comment = watch("comment") ?? ""

  return (
    <div>
      <h2 className="text-2xl font-black text-[var(--foreground)] mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        Комментарии к заказу
      </h2>
      <p className="text-sm text-[var(--muted)] mb-6">Необязательный шаг — пропустите, если нет особых требований</p>

      <Textarea
        {...register("comment")}
        rows={6}
        placeholder="Опишите особые требования: допуски, цель использования, пожелания по качеству поверхности, конкретный цвет RAL, наличие резьбы, вставок и т.д."
        className="bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--placeholder)] focus:border-[var(--accent)] resize-none"
      />
      <div className="mt-1.5 flex justify-end">
        <span className="text-xs font-mono text-[var(--muted)]">{comment.length} / 2000</span>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)]">
        <p className="text-xs text-[var(--accent)] font-medium mb-2">Что полезно указать:</p>
        <ul className="text-xs text-[var(--muted)] space-y-1">
          <li>· Допуски на размеры (например: ±0.2 мм)</li>
          <li>· Назначение изделия (прототип, рабочая деталь, декор)</li>
          <li>· Требования к поверхности (шлифовка, покраска)</li>
          <li>· Наличие резьбы, вставок, посадочных мест</li>
          <li>· Особые условия эксплуатации (температура, влага, нагрузки)</li>
        </ul>
      </div>
    </div>
  )
}
