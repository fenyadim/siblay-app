export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid"
import { getPortfolioItems } from "@/actions/portfolio"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Портфолио",
  description: "Примеры выполненных работ по 3D-печати и моделированию",
}

export default async function PortfolioPage() {
  const items = await getPortfolioItems(undefined, true)

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="label-mono">Работы</span>
          <h1
            className="mt-3 text-5xl font-black tracking-tight text-foreground"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Портфолио
          </h1>
          <p className="mt-3 text-muted max-w-xl">
            Реализованные проекты — от функциональных деталей до художественных изделий
          </p>
        </div>

        <Suspense fallback={<div className="text-muted">Загрузка...</div>}>
          <PortfolioGrid items={items} />
        </Suspense>
      </div>
    </div>
  )
}
