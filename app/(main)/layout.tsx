import { AnalyticsLayer } from "@/components/analytics/AnalyticsLayer"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Toaster } from "@/components/ui/sonner"

import "./studio.css"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsLayer>
      <Header />
      <main className="studio-main flex-1">{children}</main>
      <Footer />
      <Toaster position="bottom-right" />
    </AnalyticsLayer>
  )
}
