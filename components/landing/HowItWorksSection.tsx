const STEPS = [
  {
    num: "01",
    title: "Заявка",
    description: "Заполните форму заказа: выберите материал, цвет, укажите размеры и загрузите файлы или фото.",
  },
  {
    num: "02",
    title: "Согласование",
    description: "Свяжемся с вами в течение 2 часов, уточним детали и подтвердим стоимость.",
  },
  {
    num: "03",
    title: "Производство",
    description: "Печатаем ваше изделие с контролем качества на каждом этапе. Срок — от 1 рабочего дня.",
  },
  {
    num: "04",
    title: "Доставка",
    description: "Самовывоз, курьер или отправка СДЭК / Почтой России. Упаковываем надёжно.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-[var(--surface)] border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="label-mono">Процесс</span>
          <h2
            className="mt-3 text-4xl font-black tracking-tight text-[var(--foreground)]"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Как мы работаем
          </h2>
        </div>

        {/* Desktop: horizontal */}
        <div className="hidden md:grid grid-cols-4 gap-0">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative flex flex-col">
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="absolute top-5 left-[calc(50%+24px)] right-0 h-px bg-[var(--border)]" />
              )}
              <div className="flex flex-col items-start pr-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full border-2 border-[var(--accent)] bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
                    <span className="text-xs font-mono font-bold text-[var(--accent)]">{step.num}</span>
                  </div>
                </div>
                <h3 className="font-bold text-[var(--foreground)] mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden flex flex-col gap-0">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full border-2 border-[var(--accent)] bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono font-bold text-[var(--accent)]">{step.num}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-[var(--border)] my-2" />
                )}
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-[var(--foreground)] mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
