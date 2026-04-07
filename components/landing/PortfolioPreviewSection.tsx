import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { getPortfolioItems } from '@/actions/portfolio'
import { Button } from '@/components/ui/button'
import { PORTFOLIO_CATEGORY_LABELS } from '@/lib/validations/portfolio'

const ButtonLink = ({ className }: { className?: string }) => (
  <Button asChild variant="outline" className={className}>
    <Link href="/portfolio">
      Все работы <ArrowRight />
    </Link>
  </Button>
)

export async function PortfolioPreviewSection() {
  const items = await getPortfolioItems(undefined, true)
  const preview = items.slice(0, 6)

  return (
    <section className="py-14 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 sm:mb-16">
          <div>
            <span className="label-mono mb-3 text-sm block">Наши работы</span>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-none font-display">
              Примеры
            </h2>
          </div>
          <ButtonLink className="hidden sm:flex" />
        </div>

        {preview.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <div className="w-16 h-16 rounded-2xl border border-border bg-surface flex items-center justify-center mx-auto mb-4 opacity-40">
              <span className="text-2xl">◈</span>
            </div>
            <p className="text-sm">Работы скоро появятся</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {preview.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl border border-border bg-surface overflow-hidden hover:border-(--accent-border) transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-4/3 bg-background relative overflow-hidden">
                  {item.images[0] ? (
                    <>
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-muted opacity-20">
                      ◈
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-md text-xs font-mono bg-surface/90 backdrop-blur-sm text-muted border border-border">
                      {PORTFOLIO_CATEGORY_LABELS[item.category] ?? item.category}
                    </span>
                  </div>
                </div>
                {/* Body */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate font-display">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted mt-1 label-mono">{item.material}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center sm:hidden">
          <ButtonLink />
        </div>
      </div>
    </section>
  )
}
