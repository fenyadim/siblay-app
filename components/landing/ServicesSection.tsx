const SERVICES = [
  {
    icon: "◈",
    title: "3D-моделирование",
    description:
      "Создание 3D-модели по вашим эскизам, чертежам или фотографиям. Любая сложность — от простых деталей до органических форм.",
    tags: ["По эскизу", "По фото", "CAD/CAM"],
  },
  {
    icon: "⬡",
    title: "3D-печать FDM",
    description:
      "Послойная печать из термопластиков: PLA, ABS, PETG, Nylon. Оптимально для функциональных деталей и прототипов.",
    tags: ["PLA · ABS · PETG · Nylon", "До 300×300×400 мм"],
  },
  {
    icon: "◉",
    title: "3D-печать SLA/LCD",
    description:
      "Фотополимерная печать высокого разрешения. Идеально для фигурок, ювелирных моделей и деталей с тонкими элементами.",
    tags: ["Resin", "Точность 0.05 мм"],
  },
  {
    icon: "◫",
    title: "Постобработка",
    description:
      "Шлифовка, грунтовка, покраска, полировка. Готовые изделия с профессиональным внешним видом.",
    tags: ["Шлифовка", "Покраска", "Полировка"],
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-12">
          <span className="label-mono">Что мы делаем</span>
          <h2
            className="mt-3 text-4xl font-black tracking-tight text-[var(--foreground)]"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Услуги
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((svc) => (
            <div
              key={svc.title}
              className="card-hover group p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col"
            >
              <div className="text-3xl mb-4 text-[var(--accent)] select-none">{svc.icon}</div>
              <h3
                className="text-lg font-bold text-[var(--foreground)] mb-2"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                {svc.title}
              </h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed flex-1">
                {svc.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {svc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-xs font-mono bg-[var(--background)] text-[var(--muted)] border border-[var(--border)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
