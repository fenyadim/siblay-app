export const dynamic = "force-dynamic"

import { HeroSection } from "@/components/landing/HeroSection"
import { ServicesSection } from "@/components/landing/ServicesSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { PortfolioPreviewSection } from "@/components/landing/PortfolioPreviewSection"
import { MaterialsSection } from "@/components/landing/MaterialsSection"
import { FAQSection } from "@/components/landing/FAQSection"

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
