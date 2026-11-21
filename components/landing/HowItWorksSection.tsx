const STEPS = [
  {
    num: '01',
    title: 'Заявка',
    description:
      'Заполните форму заказа: выберите материал, цвет, укажите размеры и загрузите файлы или фото.',
  },
  {
    num: '02',
    title: 'Согласование',
    description: 'Свяжемся с вами в течение 2 часов, уточним детали и подтвердим стоимость.',
  },
  {
    num: '03',
    title: 'Производство',
    description:
      'Печатаем ваше изделие с контролем качества на каждом этапе. Срок — от 1 рабочего дня.',
  },
  {
    num: '04',
    title: 'Доставка',
    description: 'Самовывоз, курьер или отправка СДЭК / Почтой России. Упаковываем надёжно.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-[#242722] py-14 text-[#f6f5ed] lg:py-20">
      <div className="studio-container">
        <h2 className="studio-heading">Как мы работаем</h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.num} className="border-t border-[#5c6057] pt-5">
              <span className="font-mono text-sm text-[#ffa36d]">{step.num}</span>
              <h3 className="mb-3 mt-4 font-display text-2xl font-bold">{step.title}</h3>
              <p className="leading-relaxed text-[#c8ccc2]">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
