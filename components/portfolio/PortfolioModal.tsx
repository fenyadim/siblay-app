"use client"

import { useState } from "react"
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[var(--surface)] border-[var(--border)] p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images */}
          <div className="bg-[var(--background)]">
            <div className="aspect-square relative">
              {item.images[activeImg] ? (
                <img
                  src={item.images[activeImg]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-[var(--muted)] opacity-20">◈</div>
              )}
            </div>
            {item.images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {item.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-colors",
                      i === activeImg ? "border-[var(--accent)]" : "border-transparent",
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col">
            <DialogTitle
              className="text-xl font-black text-[var(--foreground)] mb-1"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {item.title}
            </DialogTitle>

            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="px-2 py-0.5 text-xs font-mono rounded-md bg-[var(--background)] text-[var(--muted)] border border-[var(--border)]">
                {PORTFOLIO_CATEGORY_LABELS[item.category] ?? item.category}
              </span>
              <span className="px-2 py-0.5 text-xs font-mono rounded-md bg-[var(--accent-subtle)] text-[var(--accent)] border border-[var(--accent-border)]">
                {item.material}
              </span>
            </div>

            {item.description && (
              <p className="text-sm text-[var(--muted)] leading-relaxed mb-4 flex-1">
                {item.description}
              </p>
            )}

            {item.params && typeof item.params === "object" && !Array.isArray(item.params) && (
              <div className="mt-auto border-t border-[var(--border)] pt-4">
                <p className="label-mono mb-3">Параметры</p>
                <div className="space-y-2">
                  {Object.entries(item.params as Record<string, string>).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-[var(--muted)]">{k}</span>
                      <span className="font-mono text-[var(--foreground)]">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
