import { getMaterialsWithColors } from '@/actions/materials'

// Rich details shown on the landing page — separate from the order form data
const MATERIAL_DETAILS: Record<
  string,
  { full: string; props: string[]; desc: string; color: string }
> = {
  PLA: {
    full: 'Polylactic Acid',
    props: ['Лёгкий', 'Точный', 'Экологичный'],
    desc: 'Лучший выбор для прототипов, декоративных изделий и учебных моделей. Легко печатается, широкая цветовая палитра.',
    color: '#01aeda',
  },
  PETG: {
    full: 'Polyethylene Terephthalate Glycol',
    props: ['Гибкий', 'Прозрачный', 'Химстойкий'],
    desc: 'Сочетает прочность ABS и простоту PLA. Подходит для пищевого контакта, медицины, деталей под нагрузку.',
    color: '#8100cc',
  },
  TPU: {
    full: 'Thermoplastic Polyurethane',
    props: ['Эластичный', 'Ударостойкий', 'Гибкий'],
    desc: 'Резиноподобный материал для прокладок, защитных чехлов, мягких деталей и изделий с амортизацией.',
    color: '#0fe24f',
  },
  ABS: {
    full: 'Acrylonitrile Butadiene Styrene',
    props: ['Прочный', 'Термостойкий', 'Ударопрочный'],
    desc: 'Для функциональных деталей, корпусов и изделий под механическую нагрузку. Выдерживает температуру до 80°C.',
    color: '#d34107',
  },
  Nylon: {
    full: 'Polyamide',
    props: ['Износостойкий', 'Гибкий', 'Прочный'],
    desc: 'Инженерный материал для шестерёнок, петель, деталей со скользящим контактом. Высокая усталостная прочность.',
    color: '#3551f1',
  },
  Resin: {
    full: 'Фотополимер',
    props: ['Высокая детализация', 'Гладкая поверхность', 'Точный'],
    desc: 'SLA/LCD печать для фигурок, ювелирных моделей, стоматологии и мелких деталей с тончайшими элементами.',
    color: '#a7a7a7',
  },
}

export async function MaterialsSection() {
  const materials = await getMaterialsWithColors()

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
          {materials.map((mat) => {
            const details = MATERIAL_DETAILS[mat.name]
            if (!details) return null

            return (
              <div
                key={mat.name}
                className="group relative card-hover p-5 rounded-2xl border border-border bg-surface-raised flex flex-col hover:border-(--accent-border) transition-all duration-300 overflow-hidden"
              >
                {/* Color glow background */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${details.color}18 0%, transparent 60%)`,
                  }}
                />

                {/* "Скоро" badge */}
                {!mat.available && (
                  <span className="absolute top-3 right-3 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-400 text-white">
                    Скоро
                  </span>
                )}

                <div className="flex items-center gap-3 mb-3 relative">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: details.color, boxShadow: `0 0 8px ${details.color}66` }}
                  />
                  <span className="text-xl font-black text-foreground font-display">
                    {mat.name}
                  </span>
                </div>
                <p className="text-xs text-muted font-mono mb-3 leading-snug relative">
                  {details.full}
                </p>
                <p className="text-xs text-muted leading-relaxed flex-1 relative">{details.desc}</p>
                <div className="mt-4 space-y-1 relative">
                  {details.props.map((p) => (
                    <div key={p} className="flex items-center gap-1.5 text-xs text-muted">
                      <span className="text-accent">·</span>
                      {p}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-border relative">
                  <span className="text-sm font-mono font-medium text-accent">{mat.price}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
