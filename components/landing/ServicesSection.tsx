import { Cuboid, Layers3, ScanLine } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const services = [
  {
    title: '3D-печать',
    Icon: Layers3,
    image: '/studio/impeller.webp',
    href: '/order',
    description:
      'Печатаем корпуса, крепления и прототипы. Подбираем пластик под нагрузку и условия работы.',
    cta: 'Рассчитать печать',
  },
  {
    title: '3D-моделирование',
    Icon: Cuboid,
    image: '/studio/model.webp',
    href: '/quote?service=modeling',
    description: 'Превращаем эскизы, чертежи и фотографии в цифровую модель для производства.',
    cta: 'Заказать модель',
  },
  {
    title: '3D-сканирование',
    Icon: ScanLine,
    image: '/studio/scan.webp',
    href: '/quote?service=scanning',
    description:
      'Оцифровываем физический объект, чтобы сохранить его форму, доработать или воспроизвести.',
    cta: 'Заказать сканирование',
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-16 bg-background py-14 lg:py-20">
      <div className="studio-container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <h2 className="studio-heading">
            Наши услуги<span>.</span>
          </h2>
          <p className="max-w-80 leading-relaxed text-muted">
            От цифровой модели до готового изделия в одной мастерской.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map(({ title, Icon, image, href, description, cta }) => (
            <Link
              key={title}
              href={href}
              className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent"
            >
              <div className="relative aspect-[1.85] overflow-hidden bg-[#deddd9]">
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1280px) 33vw, 400px"
                  className="object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-[1.035]"
                />
              </div>
              <div className="flex flex-1 flex-col p-5 lg:p-7">
                <h3 className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight lg:text-2xl">
                  <Icon size={21} className="shrink-0 text-accent" aria-hidden="true" />
                  {title}
                </h3>
                <p className="mt-3 grow leading-relaxed text-muted">{description}</p>
                <span className="mt-6 border-t border-border pt-4 text-sm font-semibold text-accent group-hover:underline">
                  {cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-1 font-display text-lg font-bold">Постобработка</h3>
            <p className="leading-relaxed text-muted">
              Шлифуем и химически разглаживаем поверхность, чтобы убрать следы слоёв.
            </p>
          </div>
          <div>
            <Link
              href="/quote?service=scanning"
              className="mb-1 inline-block font-display text-lg font-bold underline decoration-(--accent-border) underline-offset-4 hover:text-accent"
            >
              Реверс-инжиниринг
            </Link>
            <p className="leading-relaxed text-muted">
              Восстанавливаем чертежи и CAD-модели по образцу детали.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
