const SERVICES = [
  {
    num: '01',
    title: '3D-моделирование',
    description:
      'Создание 3D-модели по вашим эскизам, чертежам или фотографиям. Любая сложность — от простых деталей до органических форм.',
    tags: ['По эскизу', 'По фото', 'CAD/CAM'],
  },
  {
    num: '02',
    title: '3D-печать FDM',
    description:
      'Послойная печать из термопластиков: PLA, PETG, TPU. Оптимально для функциональных деталей и прототипов.',
    tags: ['PLA · PETG · TPU', 'До 256×256×256 мм'],
  },
  {
    num: '03',
    title: 'Постобработка',
    description:
      'Шлифовка поверхности и химическое разглаживание растворителями для достижения гладкой фактуры без следов слоёв.',
    tags: ['Шлифовка', 'Хим. разглаживание'],
  },
  {
    num: '04',
    title: '3D-сканирование',
    description:
      'Точное сканирование физических объектов для создания цифровой копии. Подходит для документирования, доработки и тиражирования изделий.',
    tags: ['Физ. объект → 3D', 'Высокая точность'],
  },
  {
    num: '05',
    title: 'Реверс-инжиниринг',
    description:
      'Восстановление чертежей и 3D-моделей по готовым деталям. Незаменимо для воспроизводства износившихся или снятых с производства компонентов.',
    tags: ['Восстановление деталей', 'CAD по образцу'],
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-14 sm:py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Asymmetric header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 sm:mb-16">
          <div>
            <span className="label-mono mb-3 text-sm block">Что мы делаем</span>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-none font-display">
              Наши услуги
            </h2>
          </div>
          <p className="text-muted max-w-xs text-sm leading-relaxed lg:text-right">
            Полный цикл от идеи до готового изделия — моделирование, печать и финишная обработка.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((svc) => (
            <div
              key={svc.title}
              className="group relative p-7 rounded-2xl border border-border bg-surface hover:border-(--accent-border) transition-all duration-300 overflow-hidden"
            >
              {/* Ghost number background */}
              <div className="absolute -top-3 -right-1 text-9xl font-black text-accent opacity-[0.04] select-none pointer-events-none leading-none font-display">
                {svc.num}
              </div>

              {/* Hover accent glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-subtle)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

              <div className="relative">
                <span className="text-xs font-mono font-semibold text-accent mb-5 block tracking-widest">
                  {svc.num}
                </span>
                <h3 className="text-xl font-bold text-foreground mb-3 font-display">{svc.title}</h3>
                <p className="text-sm text-muted leading-relaxed mb-5">{svc.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {svc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-background text-muted border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
