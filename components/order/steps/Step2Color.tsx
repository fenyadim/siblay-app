"use client"

import { useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import type { OrderFormData } from "@/lib/validations/order"
import type { MaterialWithColors } from "@/actions/materials"

interface Props {
  materials: MaterialWithColors[]
}

export function Step2Color({ materials }: Props) {
  const { watch, setValue, formState: { errors } } = useFormContext<OrderFormData>()
  const material = watch("material")
  const selectedColor = watch("color")

  const matData = materials.find((m) => m.name === material)
  const colors = matData?.colors ?? []
  const selectedColorData = colors.find((c) => c.name === selectedColor)

  return (
    <div>
      <h2 className="text-2xl font-black text-[var(--foreground)] mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        Выберите цвет
      </h2>
      <p className="text-sm text-[var(--muted)] mb-6">
        Доступные цвета для <span className="font-mono font-medium text-[var(--foreground)]">{material}</span>
      </p>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(88px,1fr))]">
        {colors.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setValue("color", c.name, { shouldValidate: true })}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-full relative",
              selectedColor === c.name
                ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border)]",
            )}
          >
            {!c.inStock && (
              <span className="absolute -top-1.5 -right-1.5 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-amber-500 text-white whitespace-nowrap leading-tight">
                Заказ
              </span>
            )}
            <div
              className="w-9 h-9 rounded-full border border-black/10 shrink-0"
              style={{ background: c.hex }}
            />
            <span className="text-xs font-medium text-[var(--muted)] text-center leading-tight w-full">{c.name}</span>
          </button>
        ))}
      </div>

      {/* Out-of-stock warning */}
      {selectedColorData && !selectedColorData.inStock && (
        <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-amber-500">
          <span className="text-white shrink-0 text-base leading-tight mt-0.5">⚠</span>
          <p className="text-sm text-white">
            Этого цвета нет в наличии, но его можно заказать.
            Срок изготовления может увеличиться на <strong>3–7 дней</strong>.
          </p>
        </div>
      )}

      {selectedColor && (
        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
          <span>Выбрано:</span>
          <span className="font-medium text-[var(--foreground)]">{selectedColor}</span>
          {selectedColorData && !selectedColorData.inStock && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500 text-white">
              под заказ
            </span>
          )}
        </div>
      )}

      {errors.color && (
        <p className="mt-3 text-sm text-[var(--error)]">{errors.color.message}</p>
      )}
    </div>
  )
}
