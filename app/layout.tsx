import type { Metadata } from "next"
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Siblay — 3D-моделирование и печать",
    template: "%s | Siblay",
  },
  description:
    "Профессиональные услуги 3D-моделирования и 3D-печати. PLA, ABS, PETG, Nylon, Resin. Прототипы, серийное производство, постобработка.",
  keywords: ["3D печать", "3D моделирование", "прототипирование", "FDM", "SLA", "Siblay"],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Siblay",
    title: "Siblay — 3D-моделирование и печать",
    description: "Профессиональные услуги 3D-печати под заказ",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
