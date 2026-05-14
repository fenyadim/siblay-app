import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Manrope } from 'next/font/google'

import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { getBusinessJsonLd, siteUrl, websiteJsonLd } from '@/lib/seo'

import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Siblay — 3D-печать и 3D-моделирование в Иркутске на заказ',
    template: '%s | Siblay — 3D-печать в Иркутске',
  },
  description:
    'Студия 3D-печати и 3D-моделирования в Иркутске. PLA, PETG, TPU. Прототипы, серийное производство, постобработка, 3D-сканирование. Расчёт стоимости онлайн.',
  applicationName: 'Siblay',
  keywords: [
    '3D печать Иркутск',
    '3D печать в Иркутске',
    '3D печать на заказ Иркутск',
    '3D моделирование Иркутск',
    '3D сканирование Иркутск',
    'печать на 3D принтере Иркутск',
    '3D печать',
    '3D моделирование',
    '3D печать на заказ',
    'прототипирование',
    'FDM печать',
    'PLA',
    'PETG',
    'TPU',
    'постобработка 3D-печати',
    'серийное производство',
    'реверс-инжиниринг',
    'Siblay',
  ],
  authors: [{ name: 'Siblay' }],
  creator: 'Siblay',
  publisher: 'Siblay',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: siteUrl,
    siteName: 'Siblay',
    title: 'Siblay — 3D-печать и 3D-моделирование в Иркутске на заказ',
    description:
      'Студия 3D-печати в Иркутске. PLA, PETG, TPU — от прототипа до серии. Расчёт онлайн.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siblay — 3D-печать и 3D-моделирование в Иркутске',
    description: 'Студия 3D-печати в Иркутске. PLA, PETG, TPU — от прототипа до серии.',
  },
  verification: {
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'manufacturing',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf6' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0d0d' },
  ],
  colorScheme: 'light dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { organization, localBusiness } = getBusinessJsonLd()
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${manrope.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
