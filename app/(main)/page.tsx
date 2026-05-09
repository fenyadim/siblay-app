import type { Metadata } from "next"

import { FAQSection } from "@/components/landing/FAQSection"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { MaterialsSection } from "@/components/landing/MaterialsSection"
import { PortfolioPreviewSection } from "@/components/landing/PortfolioPreviewSection"
import { ServicesSection } from "@/components/landing/ServicesSection"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Siblay — 3D-моделирование и 3D-печать на заказ",
  description:
    "Печатаем прототипы, детали, фигурки и серийные изделия. PLA, PETG, TPU. Расчёт стоимости онлайн, срок от 24 часов, доставка по России.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Siblay — 3D-моделирование и 3D-печать на заказ",
    description:
      "Печатаем прототипы, детали, фигурки и серийные изделия. PLA, PETG, TPU.",
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
      <MaterialsSection />
      <FAQSection />
    </>
  )
}
