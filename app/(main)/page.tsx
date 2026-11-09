import type { Metadata } from "next"

import { FAQSection } from "@/components/landing/FAQSection"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { MaterialsSection } from "@/components/landing/MaterialsSection"
import { PortfolioPreviewSection } from "@/components/landing/PortfolioPreviewSection"
import { ReviewsSection } from "@/components/landing/ReviewsSection"
import { ServicesSection } from "@/components/landing/ServicesSection"
import { printerModel } from "@/lib/printer"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "3D-печать и 3D-моделирование в Иркутске — Siblay",
  description:
    `3D-печать на ${printerModel} в Иркутске. Изготавливаем прототипы и партии деталей из PLA, PETG и TPU. Расчёт стоимости онлайн, доставка по России.`,
  alternates: { canonical: "/" },
  openGraph: {
    title: "3D-печать и 3D-моделирование в Иркутске — Siblay",
    description:
      `Печатаем прототипы и партии деталей на ${printerModel} в Иркутске. Работаем с PLA, PETG и TPU.`,
    url: "/",
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <PortfolioPreviewSection />
      <ReviewsSection />
      <MaterialsSection />
      <FAQSection />
    </>
  )
}
