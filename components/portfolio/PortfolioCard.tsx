import Image from 'next/image'
import Link from 'next/link'

import type { PortfolioItem } from '@/app/generated/prisma/client'
import { PORTFOLIO_CATEGORY_LABELS } from '@/lib/validations/portfolio'

interface PortfolioCardProps {
  item: PortfolioItem
  priority?: boolean
}

export function PortfolioCard({ item, priority = false }: PortfolioCardProps) {
  return (
    <Link
      href={`/portfolio/${item.id}`}
      className="card-hover group block w-full text-left rounded-2xl border border-border bg-surface overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
    >
      <div className="relative bg-background overflow-hidden aspect-4/3">
        {item.images[0] ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={priority}
            {...(item.imageBlurs[0]
              ? { placeholder: "blur" as const, blurDataURL: item.imageBlurs[0] }
              : {})}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-5xl text-muted opacity-20">
            ◈
          </div>
        )}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 text-xs font-mono rounded-md bg-surface/90 text-muted border border-border">
            {PORTFOLIO_CATEGORY_LABELS[item.category] ?? item.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground font-display">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-muted mt-1 line-clamp-2">{item.description}</p>
        )}
        <p className="label-mono mt-2">{item.material}</p>
      </div>
    </Link>
  )
}
