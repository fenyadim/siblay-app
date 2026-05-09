import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Manrope } from 'next/font/google'

import { ThemeProvider } from '@/components/layout/ThemeProvider'

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://siblay.ru'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Siblay — 3D-моделирование и 3D-печать на заказ',
    template: '%s | Siblay',
  },
  description:
    'Профессиональные услуги 3D-моделирования и 3D-печати на заказ. PLA, PETG, TPU. Прототипы, серийное производство, постобработка. Расчёт стоимости онлайн.',
  applicationName: 'Siblay',
  keywords: [
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
    title: 'Siblay — 3D-моделирование и 3D-печать на заказ',
    description:
      'Профессиональные услуги 3D-печати под заказ. PLA, PETG, TPU — от прототипа до серии.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Siblay — 3D-моделирование и 3D-печать на заказ',
    description: 'Профессиональные услуги 3D-печати под заказ. PLA, PETG, TPU.',
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}#organization`,
  name: 'Siblay',
  url: siteUrl,
  logo: `${siteUrl}/siblay-logo.svg`,
  description:
    'Профессиональные услуги 3D-моделирования и 3D-печати на заказ. PLA, PETG, TPU.',
  email: 'info@siblay.ru',
  areaServed: 'RU',
  sameAs: [] as string[],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}#website`,
  url: siteUrl,
  name: 'Siblay',
  inLanguage: 'ru-RU',
  publisher: { '@id': `${siteUrl}#organization` },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
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
