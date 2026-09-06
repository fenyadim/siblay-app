import { getMaterialsWithColors } from '@/actions/materials'
import { readPublicSection } from '@/lib/public-section-data'

import { MaterialsCarousel } from './MaterialsCarousel'

export async function MaterialsSection() {
  const materials = await readPublicSection('materials', getMaterialsWithColors)
  if (materials === null) return null

  return (
    <section className="py-14 sm:py-24 bg-surface border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Asymmetric header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 sm:mb-16">
          <div>
            <span className="label-mono mb-3 text-sm block">Чем печатаем</span>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-none font-display">
              Материалы
            </h2>
          </div>
          <p className="text-muted max-w-xs text-sm leading-relaxed lg:text-right">
            Подбираем материал под ваши задачи — от гибких прокладок до жёстких инженерных деталей.
          </p>
        </div>

        <MaterialsCarousel materials={materials} />
      </div>
    </section>
  )
}
