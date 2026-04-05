"use client"

import { useFormContext } from "react-hook-form"
import { calculatePrice, formatPrice, formatFileSize } from "@/lib/utils"
import type { OrderFormData } from "@/lib/validations/order"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function SummaryPanel() {
  const { watch } = useFormContext<OrderFormData>()
  const [open, setOpen] = useState(false)

  const values = watch()
  const {
    material, color, width, height, length,
    quantity, infill, hasModel, files,
  } = values

  const hasAllDims = width > 0 && height > 0 && length > 0
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
    <div className="space-y-4 text-sm">
      {/* Material & Color */}
      <div>
        <p className="label-mono mb-2">Материал и цвет</p>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[var(--foreground)]">{material || "—"}</span>
          {color && (
            <>
              <span className="text-[var(--muted)]">·</span>
              <span className="text-[var(--muted)]">{color}</span>
            </>
          )}
        </div>
      </div>

      {/* Dimensions */}
      {hasAllDims && (
        <div>
          <p className="label-mono mb-2">Размеры</p>
          <p className="font-mono text-[var(--foreground)]">
            {length}×{width}×{height} мм
          </p>
        </div>
      )}

      {/* Qty + Infill */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="label-mono mb-1">Кол-во</p>
          <p className="font-mono text-[var(--foreground)]">{quantity || 1} шт.</p>
        </div>
        <div>
          <p className="label-mono mb-1">Infill</p>
          <p className="font-mono text-[var(--foreground)]">{infill || 50}%</p>
        </div>
      </div>

      {/* Files */}
      {files?.length > 0 && (
        <div>
          <p className="label-mono mb-2">Файлы ({files.length})</p>
          <div className="space-y-1">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[var(--muted)] truncate">
                <span className="shrink-0 font-mono text-[var(--accent)]">
                  {f.fileName.split(".").pop()?.toUpperCase()}
                </span>
                <span className="truncate">{f.fileName}</span>
                <span className="shrink-0">{formatFileSize(f.fileSize)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No model warning */}
      {hasModel === false && (
        <div className="rounded-lg border border-[var(--warning)]/30 bg-amber-50 dark:bg-amber-900/10 p-2.5">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            ⚠️ Нужно моделирование (+50%)
          </p>
        </div>
      )}

      {/* Price */}
      <div className="pt-3 border-t border-[var(--border)]">
        <p className="label-mono mb-1">Ориентировочная стоимость</p>
        {price !== null ? (
          <div>
            <p className="text-xl font-black text-[var(--accent)]" style={{ fontFamily: "Syne, sans-serif" }}>
              {formatPrice(price)}
            </p>
            {!hasModel && hasAllDims && (
              <p className="text-xs text-[var(--muted)] mt-0.5 font-mono">
                вкл. моделирование ×1.5
              </p>
            )}
            <p className="text-xs text-[var(--muted)] mt-1">
              Окончательная цена после согласования
            </p>
          </div>
        ) : (
          <p className="text-[var(--muted)]">Укажите размеры для расчёта</p>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block sticky top-24 self-start">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="font-black text-[var(--foreground)] mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
            Ваш заказ
          </h3>
          {content}
        </div>
      </aside>

      {/* Mobile bottom sheet toggle */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[var(--surface)] border-t border-[var(--border)]"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--foreground)]">Ваш заказ</span>
            {price !== null && (
              <span className="font-mono font-bold text-[var(--accent)]">{formatPrice(price)}</span>
            )}
          </div>
          <svg
            width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            className={cn("text-[var(--muted)] transition-transform", open && "rotate-180")}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {open && (
          <div className="bg-[var(--surface)] border-t border-[var(--border)] px-4 pt-4 pb-6 max-h-[60vh] overflow-y-auto">
            {content}
          </div>
        )}
      </div>
    </>
  )
}
