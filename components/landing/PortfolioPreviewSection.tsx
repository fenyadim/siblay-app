import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getPortfolioItems } from "@/actions/portfolio"
import { PORTFOLIO_CATEGORY_LABELS } from "@/lib/validations/portfolio"

export async function PortfolioPreviewSection() {
  const items = await getPortfolioItems(undefined, true)
  const preview = items.slice(0, 6)

  return (
    <section className="py-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="label-mono">Наши работы</span>
            <h2
              className="mt-3 text-4xl font-black tracking-tight text-[var(--foreground)]"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Примеры работ
            </h2>
          </div>
          <Button asChild variant="outline" className="hidden sm:flex border-[var(--border)]">
            <Link href="/portfolio">Все работы →</Link>
          </Button>
        </div>

        {preview.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted)]">
            <p className="text-4xl mb-4 opacity-30">◈</p>
            <p>Работы скоро появятся</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {preview.map((item) => (
              <div
                key={item.id}
                className="card-hover group rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-[var(--background)] relative overflow-hidden">
                  {item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-[var(--muted)] opacity-30">
                      ◈
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-md text-xs font-mono bg-[var(--surface)]/90 text-[var(--muted)] border border-[var(--border)]">
                      {PORTFOLIO_CATEGORY_LABELS[item.category] ?? item.category}
                    </span>
                  </div>
                </div>
                {/* Body */}
                <div className="p-4">
                  <h3 className="font-semibold text-[var(--foreground)] truncate" style={{ fontFamily: "Syne, sans-serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--muted)] mt-1 label-mono">{item.material}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center sm:hidden">
          <Button asChild variant="outline" className="border-[var(--border)]">
            <Link href="/portfolio">Все работы →</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
