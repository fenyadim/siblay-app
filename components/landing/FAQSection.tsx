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
    a: "Для FDM-печати рабочая область — до 300×300×400 мм. Более крупные изделия можно разбить на части и склеить. Для SLA-печати — до 150×85×185 мм, с максимальной точностью деталей.",
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
    <section className="py-20 bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <span className="label-mono">Вопросы и ответы</span>
          <h2
            className="mt-3 text-4xl font-black tracking-tight text-[var(--foreground)]"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Частые вопросы
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {FAQ.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border border-[var(--border)] rounded-xl px-5 bg-[var(--surface)] data-[state=open]:border-[var(--accent-border)] transition-colors"
            >
              <AccordionTrigger className="text-left font-semibold text-[var(--foreground)] hover:no-underline py-5 text-sm">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-[var(--muted)] leading-relaxed pb-5">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
