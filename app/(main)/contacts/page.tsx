import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { business, getBusinessJsonLd, siteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Контакты Siblay',
  description:
    'Контакты Siblay в Иркутске: телефон, почта, Telegram, VK и адрес для заказов на 3D-печать, 3D-моделирование и 3D-сканирование.',
  alternates: { canonical: '/contacts' },
  openGraph: {
    title: 'Контакты Siblay — 3D-печать в Иркутске',
    description:
      'Свяжитесь с Siblay для заказа 3D-печати, моделирования, 3D-сканирования и реверс-инжиниринга в Иркутске.',
    url: '/contacts',
  },
}

const { fullAddress } = getBusinessJsonLd()

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${siteUrl}/contacts#webpage`,
  url: `${siteUrl}/contacts`,
  name: 'Контакты Siblay',
  inLanguage: 'ru-RU',
  about: { '@id': `${siteUrl}#localbusiness` },
  mainEntity: {
    '@id': `${siteUrl}#localbusiness`,
  },
}

const mapUrl = `https://yandex.ru/map-widget/v1/?ll=${business.geo.longitude}%2C${business.geo.latitude}&z=15&pt=${business.geo.longitude}%2C${business.geo.latitude},pm2rdm`

const contactItems = [
  {
    label: 'Телефон',
    value: business.phoneDisplay,
    href: `tel:${business.phone}`,
    Icon: Phone,
  },
  {
    label: 'Почта',
    value: business.email,
    href: `mailto:${business.email}`,
    Icon: Mail,
  },
  {
    label: 'Telegram',
    value: '@siblay_print',
    href: 'https://t.me/siblay_print',
    Icon: MessageCircle,
  },
  {
    label: 'VK',
    value: 'vk.com/dima_orlov1',
    href: 'https://vk.com/dima_orlov1',
    Icon: MessageCircle,
  },
]

export default function ContactsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      <div className="min-h-screen bg-background">
        <section className="border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <span className="label-mono">Связь</span>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-foreground font-display">
              Контакты
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted leading-relaxed">
              Напишите или позвоните, если нужно рассчитать 3D-печать, подготовить модель,
              отсканировать деталь или обсудить реверс-инжиниринг.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
              <div className="space-y-4">
                {contactItems.map(({ label, value, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-(--accent-border) hover:bg-(--accent-subtle)"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-(--accent-subtle) text-accent">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-mono uppercase tracking-[0.12em] text-muted">
                        {label}
                      </span>
                      <span className="mt-1 block break-words text-base font-semibold text-foreground group-hover:text-accent">
                        {value}
                      </span>
                    </span>
                  </a>
                ))}

                <div className="rounded-xl border border-border bg-surface p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-(--accent-subtle) text-accent">
                      <MapPin className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-[0.12em] text-muted">
                        Адрес
                      </p>
                      <p className="mt-1 text-base font-semibold text-foreground">
                        {business.address.city}, {business.address.street}
                      </p>
                      <p className="mt-2 text-sm text-muted">
                        Точный способ передачи детали или готового заказа согласуем после заявки.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Button asChild className="h-11 bg-accent text-white hover:bg-(--accent-hover)">
                    <Link href="/order">Заказать печать</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-11">
                    <Link href="/quote">Обсудить проект</Link>
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <iframe
                  src={mapUrl}
                  title={`Карта: ${fullAddress}`}
                  className="block h-96 w-full lg:h-full min-h-96"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
