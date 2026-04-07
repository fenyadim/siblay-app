'use client'

import { useState } from 'react'

import type { PortfolioItem } from '@/app/generated/prisma/client'
import { PORTFOLIO_CATEGORIES } from '@/lib/validations/portfolio'

import { Button } from '../ui/button'
import { PortfolioCard } from './PortfolioCard'
import { PortfolioModal } from './PortfolioModal'

const ALL_CATEGORIES = [{ value: 'all', label: 'Все' }, ...PORTFOLIO_CATEGORIES]

interface PortfolioGridProps {
  items: PortfolioItem[]
}

export function PortfolioGrid({ items }: PortfolioGridProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered =
    activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory)

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {ALL_CATEGORIES.map((cat) => (
          <Button
            variant={activeCategory === cat.value ? 'default' : 'outline'}
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-3 opacity-20">◈</p>
          <p className="text-muted">Работ в этой категории пока нет</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="break-inside-avoid">
              <PortfolioModal item={item}>
                <PortfolioCard item={item} />
              </PortfolioModal>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
