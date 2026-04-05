import { PORTFOLIO_CATEGORY_LABELS } from "@/lib/validations/portfolio"
import type { PortfolioItem } from "@/app/generated/prisma/client"

interface PortfolioCardProps {
  item: PortfolioItem
  onClick: () => void
}

export function PortfolioCard({ item, onClick }: PortfolioCardProps) {
  return (
    <button
      onClick={onClick}
      className="card-hover group w-full text-left rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
    >
      {/* Image */}
      <div className="relative bg-[var(--background)] overflow-hidden">
        {item.images[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="aspect-[4/3] flex items-center justify-center text-5xl text-[var(--muted)] opacity-20">
            ◈
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-xs font-mono rounded-md bg-[var(--surface)]/90 text-[var(--muted)] border border-[var(--border)]">
            {PORTFOLIO_CATEGORY_LABELS[item.category] ?? item.category}
          </span>
        </div>
      </div>
      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-[var(--foreground)]" style={{ fontFamily: "Syne, sans-serif" }}>
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm text-[var(--muted)] mt-1 line-clamp-2">{item.description}</p>
        )}
        <p className="label-mono mt-2">{item.material}</p>
      </div>
    </button>
  )
}
