"use client"

import { useState, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { PORTFOLIO_CATEGORY_LABELS } from "@/lib/validations/portfolio"
import { cn } from "@/lib/utils"
import type { PortfolioItem } from "@/app/generated/prisma/client"

interface PortfolioModalProps {
  item: PortfolioItem
  onClose: () => void
}

export function PortfolioModal({ item, onClose }: PortfolioModalProps) {
  const [activeImg, setActiveImg] = useState(0)
  const hasMultiple = item.images.length > 1

  const goPrev = useCallback(() => {
    setActiveImg((prev) => (prev - 1 + item.images.length) % item.images.length)
  }, [item.images.length])

  const goNext = useCallback(() => {
    setActiveImg((prev) => (prev + 1) % item.images.length)
  }, [item.images.length])

  // Keyboard navigation
  useEffect(() => {
    if (!hasMultiple) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [hasMultiple, goPrev, goNext])

  const params =
    item.params && typeof item.params === "object" && !Array.isArray(item.params)
      ? (item.params as Record<string, string>)
      : null

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[var(--surface)] border-[var(--border)] p-0 overflow-hidden rounded-2xl shadow-2xl shadow-black/20 gap-0">
        <div className="grid grid-cols-1 md:grid-cols-2 md:h-[520px]">

          {/* ── Left: Image area ── */}
          <div className="relative flex flex-col bg-[var(--background)] min-h-[260px] md:min-h-0">
            {/* Main image */}
            <div className="relative flex-1 overflow-hidden">
              {item.images[activeImg] ? (
                <img
                  key={activeImg}
                  src={item.images[activeImg]}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-7xl opacity-10 text-[var(--foreground)]">◈</span>
                </div>
              )}

              {/* Prev / Next arrows */}
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    aria-label="Предыдущее фото"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                    aria-label="Следующее фото"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {hasMultiple && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
                  {item.images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      className={cn(
                        "rounded-full transition-all duration-200",
                        i === activeImg
                          ? "w-5 h-1.5 bg-white"
                          : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80",
                      )}
                      aria-label={`Фото ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {hasMultiple && (
              <div className="flex gap-2 p-3 border-t border-[var(--border)] overflow-x-auto">
                {item.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200",
                      i === activeImg
                        ? "border-[var(--accent)] scale-105 shadow-sm shadow-[var(--accent)]/30"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info area ── */}
          <div className="flex flex-col p-7 border-l border-[var(--border)] overflow-y-auto">

            {/* Tags */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--background)] text-[var(--muted)] border border-[var(--border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]" />
                {PORTFOLIO_CATEGORY_LABELS[item.category] ?? item.category}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                {item.material}
              </span>
            </div>

            {/* Title */}
            <DialogTitle
              className="text-2xl font-black text-[var(--foreground)] leading-tight mb-3"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {item.title}
            </DialogTitle>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
                {item.description}
              </p>
            )}

            {/* Params */}
            {params && (
              <div className="mt-auto">
                <p className="label-mono mb-3">Параметры</p>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
                  {Object.entries(params).map(([k, v], idx, arr) => (
                    <div
                      key={k}
                      className={cn(
                        "flex items-center justify-between px-4 py-3",
                        idx < arr.length - 1 && "border-b border-[var(--border)]",
                      )}
                    >
                      <span className="text-xs text-[var(--muted)]">{k}</span>
                      <span className="text-xs font-mono font-semibold text-[var(--foreground)] bg-[var(--surface)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <a
              href="/order"
              className="mt-6 flex items-center justify-center gap-2 w-full h-10 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold transition-colors"
            >
              Заказать похожее
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
