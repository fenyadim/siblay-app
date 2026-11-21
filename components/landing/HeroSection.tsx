import { Box, Grid2X2, Layers3, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { OrderCtaButton } from '@/components/order-cta/OrderCtaDialog'
import { printArea } from '@/lib/printer'

const specifications = [
  { label: 'Технология', value: 'Послойная печать FDM', Icon: Layers3 },
  { label: 'Область печати', value: printArea, Icon: Box },
  { label: 'Доставка', value: 'По всей России', Icon: Truck },
]

export function HeroSection() {
  return (
    <>
      <section aria-labelledby="hero-title" className="studio-hero">
        <div className="studio-hero-image">
          <Image
            src="/studio/printing.webp"
            alt="Сопло 3D-принтера укладывает пластик на изогнутые лопасти крыльчатки"
            fill
            preload
            sizes="(min-width: 768px) 65vw, 100vw"
            className="object-cover"
          />
          <div className="studio-caption" aria-hidden="true">
            <span className="studio-crosshair" />
            FDM / Послойная печать
          </div>
        </div>
        <div className="studio-container">
          <div className="studio-hero-copy">
            <p className="studio-kicker">
              <span aria-hidden="true" /> Студия 3D-печати
            </p>
            <h1 id="hero-title">
              Точность
              <br />
              в каждом
              <br />
              <em>слое.</em>
            </h1>
            <p className="studio-hero-intro">
              Моделируем и печатаем в Иркутске. От первого прототипа по вашему эскизу до партии
              готовых деталей.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <OrderCtaButton className="studio-primary-button">Рассчитать заказ</OrderCtaButton>
              <Link className="studio-secondary-button" href="/portfolio">
                <Grid2X2 aria-hidden="true" size={16} />{' '}
                <span className="hidden sm:inline">Смотреть работы</span>
                <span className="sm:hidden">Портфолио</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <div className="border-b border-border bg-surface">
        <div className="studio-container">
          <dl className="studio-specs">
            {specifications.map(({ label, value, Icon }) => (
              <div key={label} className="studio-spec">
                <dt>
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                  {label}
                </dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </>
  )
}
