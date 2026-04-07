import type { Metadata } from 'next'
import { JetBrains_Mono, Outfit, Syne } from 'next/font/google'

import { ThemeProvider } from '@/components/layout/ThemeProvider'

import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
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
      className={`${outfit.variable} ${syne.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
