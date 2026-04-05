const SERVICES = [
  {
    num: "01",
    title: "3D-моделирование",
    description:
      "Создание 3D-модели по вашим эскизам, чертежам или фотографиям. Любая сложность — от простых деталей до органических форм.",
    tags: ["По эскизу", "По фото", "CAD/CAM"],
  },
  {
    num: "02",
    title: "3D-печать FDM",
    description:
      "Послойная печать из термопластиков: PLA, ABS, PETG, Nylon. Оптимально для функциональных деталей и прототипов.",
    tags: ["PLA · ABS · PETG · Nylon", "До 300×300×400 мм"],
  },
  {
    num: "03",
    title: "3D-печать SLA/LCD",
    description:
      "Фотополимерная печать высокого разрешения. Идеально для фигурок, ювелирных моделей и деталей с тонкими элементами.",
    tags: ["Resin", "Точность 0.05 мм"],
  },
  {
    num: "04",
    title: "Постобработка",
    description:
      "Шлифовка, грунтовка, покраска, полировка. Готовые изделия с профессиональным внешним видом.",
    tags: ["Шлифовка", "Покраска", "Полировка"],
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-[var(--background)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Asymmetric header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <span className="label-mono mb-3 block">Что мы делаем</span>
            <h2
              className="text-5xl lg:text-6xl font-black tracking-tight leading-none"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              <span className="text-[var(--foreground)]">Наши</span>{" "}
              <span className="gradient-text">услуги</span>
            </h2>
          </div>
          <p className="text-[var(--muted)] max-w-xs text-sm leading-relaxed lg:text-right">
            Полный цикл от идеи до готового изделия — моделирование, печать и финишная обработка.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SERVICES.map((svc) => (
            <div
              key={svc.title}
              className="group relative p-7 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border)] transition-all duration-300 overflow-hidden"
            >
              {/* Ghost number background */}
              <div
                className="absolute -top-3 -right-1 text-9xl font-black text-[var(--accent)] opacity-[0.04] select-none pointer-events-none leading-none"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {svc.num}
              </div>

              {/* Hover accent glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-subtle)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

              <div className="relative">
                <span className="text-xs font-mono font-semibold text-[var(--accent)] mb-5 block tracking-widest">
                  {svc.num}
                </span>
                <h3
                  className="text-xl font-bold text-[var(--foreground)] mb-3"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {svc.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-5">{svc.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {svc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[var(--background)] text-[var(--muted)] border border-[var(--border)]"
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
