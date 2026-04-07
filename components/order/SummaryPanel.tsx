"use client"

import { useFormContext } from "react-hook-form"
import { calculatePrice, formatPrice, formatFileSize } from "@/lib/utils"
import type { OrderFormData } from "@/lib/validations/order"
import { cn } from "@/lib/utils"
import { useState } from "react"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2.5 border-b border-border last:border-0">
      <span className="text-xs text-muted shrink-0">{label}</span>
      <span className="text-xs font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

export function SummaryPanel() {
  const { watch } = useFormContext<OrderFormData>()
  const [open, setOpen] = useState(false)

  const values = watch()
  const { material, color, width, height, length, quantity, infill, hasModel, files } = values

  const hasAllDims = Number(width) > 0 && Number(height) > 0 && Number(length) > 0
  const price = hasAllDims && material
    ? calculatePrice({
        material,
        width: Number(width),
        height: Number(height),
        length: Number(length),
        quantity: Number(quantity) || 1,
        infill: Number(infill) || 50,
        hasModel: hasModel ?? true,
      })
    : null

  const content = (
    <div>
      <div className="divide-y divide-border mb-4">
        {material && <Row label="Материал" value={<span className="font-mono">{material}</span>} />}
        {color && <Row label="Цвет" value={color} />}
        {hasAllDims && (
          <Row
            label="Размеры"
            value={<span className="font-mono">{length}×{width}×{height} мм</span>}
          />
        )}
        {(quantity ?? 1) > 0 && (
          <Row label="Количество" value={<span className="font-mono">{quantity || 1} шт.</span>} />
        )}
        {infill && (
          <Row label="Заполнение" value={<span className="font-mono">{infill}%</span>} />
        )}
        {(files?.length ?? 0) > 0 && (
          <Row label="Файлы" value={`${files.length} шт.`} />
        )}
        {hasModel === false && (
          <Row label="Моделирование" value={<span className="text-amber-600">+50%</span>} />
        )}
      </div>

      {/* Price block */}
      <div
        className="rounded-xl p-4"
        style={{ background: "linear-gradient(135deg, var(--accent-subtle), #7c3aed1a)" }}
      >
        <p className="text-xs text-muted mb-1">Ориентировочная стоимость</p>
        {price !== null ? (
          <>
            <p
              className="text-2xl font-black font-display" style={{ color: "var(--accent)" }}
            >
              {formatPrice(price)}
            </p>
            <p className="text-[11px] text-muted mt-1 leading-snug">
              Окончательная цена после согласования
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">Укажите размеры для расчёта</p>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block sticky top-24 self-start">
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-surface-raised">
            <h3
              className="font-black text-foreground font-display"
            >
              Ваш заказ
            </h3>
          </div>
          <div className="p-5">{content}</div>
        </div>
      </aside>

      {/* Mobile bottom sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-surface border-t border-border"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "linear-gradient(135deg, var(--accent), #7c3aed)" }}
            />
            <span className="text-sm font-semibold text-foreground">Ваш заказ</span>
            {price !== null && (
              <span
                className="text-sm font-black font-display" style={{ color: "var(--accent)" }}
              >
                {formatPrice(price)}
              </span>
            )}
          </div>
          <svg
            width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            className={cn("text-muted transition-transform duration-200", open && "rotate-180")}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {open && (
          <div className="bg-surface border-t border-border px-5 pt-5 pb-6 max-h-[55vh] overflow-y-auto">
            {content}
          </div>
        )}
      </div>
    </>
  )
}
