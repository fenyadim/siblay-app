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
    <section id="how-it-works" className="py-24 bg-surface border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="label-mono mb-3 block">Процесс</span>
          <h2
            className="text-5xl font-black tracking-tight text-foreground"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Как мы работаем
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative">
              {/* Connector line (desktop only) */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden lg:block absolute top-8 left-[calc(50%+2.5rem)] right-[-1rem] h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--accent-border) 0%, transparent 100%)",
                  }}
                />
              )}

              <div className="flex flex-col">
                {/* Step circle */}
                <div className="relative w-16 h-16 mb-6">
                  {/* Soft glow ring */}
                  <div
                    className="absolute inset-0 rounded-full opacity-20"
                    style={{
                      background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
                    }}
                  />
                  <div className="absolute inset-0 rounded-full border border-(--accent-border) bg-surface flex items-center justify-center">
                    <span className="text-sm font-mono font-bold text-accent">{step.num}</span>
                  </div>
                </div>

                <h3
                  className="text-lg font-bold text-foreground mb-2"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
