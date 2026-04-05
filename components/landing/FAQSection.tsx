import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQ = [
  {
    q: "Что делать, если у меня нет 3D-модели?",
    a: "Ничего страшного — просто выберите «У меня нет 3D-модели» при оформлении заказа и загрузите фотографии или эскизы изделия с нескольких ракурсов. Наши специалисты создадут модель по вашим материалам. Услуга моделирования включается в стоимость автоматически.",
  },
  {
    q: "Какой максимальный размер изделия?",
    a: "Рабочая область FDM-принтера — до 256×256×256 мм. Более крупные изделия можно разбить на части и склеить — мы поможем с этим на этапе моделирования.",
  },
  {
    q: "Сколько времени занимает изготовление?",
    a: "Стандартный срок — 1–3 рабочих дня в зависимости от размера и сложности. Срочные заказы (24ч) доступны за дополнительную плату. Конкретные сроки согласуем при подтверждении заказа.",
  },
  {
    q: "Как рассчитывается стоимость печати?",
    a: "Цена зависит от объёма изделия, выбранного материала, процента заполнения (infill) и количества экземпляров. Предварительный расчёт вы можете сделать прямо в форме заказа — он обновляется автоматически при изменении параметров.",
  },
  {
    q: "Какие форматы файлов принимаете?",
    a: "Принимаем STL, OBJ, 3MF, STEP/STP. Рекомендуем STEP для технических деталей и STL для остальных изделий. Если модель в другом формате — напишите нам, обычно конвертация не проблема.",
  },
  {
    q: "Можно ли заказать покраску и постобработку?",
    a: "Да, это отдельная услуга. Мы выполняем шлифовку поверхности, грунтовку, покраску в любой цвет RAL, глянцевую и матовую полировку. Укажите ваши пожелания в комментарии к заказу.",
  },
  {
    q: "Как происходит доставка?",
    a: "Предлагаем самовывоз, курьерскую доставку по городу, а также отправку через СДЭК и Почту России по всей России. Адрес и условия доставки указываете на последнем шаге формы заказа.",
  },
]

export function FAQSection() {
  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
          {/* Left: sticky heading */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="label-mono mb-3 block">Вопросы и ответы</span>
            <h2
              className="text-5xl font-black tracking-tight leading-tight mb-5"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Частые
              <br />
              вопросы
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Не нашли ответ? Напишите нам — ответим в течение часа.
            </p>
          </div>

          {/* Right: accordion */}
          <div>
            <Accordion type="single" collapsible className="space-y-2">
              {FAQ.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border border-[var(--border)] rounded-xl px-5 bg-[var(--surface)] data-[state=open]:border-[var(--accent-border)] data-[state=open]:bg-[var(--accent-subtle)]/40 transition-all duration-200"
                >
                  <AccordionTrigger className="text-left font-semibold text-[var(--foreground)] hover:no-underline py-5 text-sm gap-4">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-[var(--muted)] leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
