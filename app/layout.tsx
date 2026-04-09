import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: {
    default: 'Siblay — 3D-моделирование и печать',
    template: '%s | Siblay',
  },
  description:
    'Профессиональные услуги 3D-моделирования и 3D-печати. PLA, PETG, TPU. Прототипы, серийное производство, постобработка.',
  keywords: ['3D печать', '3D моделирование', 'прототипирование', 'FDM', 'SLA', 'Siblay'],
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Siblay',
    title: 'Siblay — 3D-моделирование и печать',
    description: 'Профессиональные услуги 3D-печати под заказ',
  },
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
