import type { Metadata } from "next"

import { FAQSection } from "@/components/landing/FAQSection"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { MaterialsSection } from "@/components/landing/MaterialsSection"
import { PortfolioPreviewSection } from "@/components/landing/PortfolioPreviewSection"
import { ReviewsSection } from "@/components/landing/ReviewsSection"
import { ServicesSection } from "@/components/landing/ServicesSection"

export const revalidate = 300

export const metadata: Metadata = {
  title: "3D-печать и 3D-моделирование в Иркутске — Siblay",
  description:
    "3D-печать в Иркутске на заказ: прототипы, детали, фигурки и серийные изделия. PLA, PETG, TPU. Расчёт стоимости онлайн, срок от 24 часов, доставка по России.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "3D-печать и 3D-моделирование в Иркутске — Siblay",
    description:
      "3D-печать в Иркутске на заказ: прототипы, детали, фигурки и серийные изделия. PLA, PETG, TPU.",
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
