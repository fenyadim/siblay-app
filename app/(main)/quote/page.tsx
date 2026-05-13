export const dynamic = "force-dynamic"

import type { Metadata } from "next"

import { QuoteFormClient } from "@/components/quote/QuoteFormClient"

export const metadata: Metadata = {
  title: "Заявка на 3D-моделирование и 3D-сканирование",
  description:
    "Оставьте заявку на 3D-моделирование по эскизам или фото, 3D-сканирование объектов и реверс-инжиниринг. Менеджер свяжется в течение 2 часов.",
  alternates: { canonical: "/quote" },
  openGraph: {
    title: "Заявка на 3D-моделирование и 3D-сканирование — Siblay",
    description:
      "Моделирование по эскизам, фото и чертежам; 3D-сканирование объектов и реверс-инжиниринг.",
    url: "/quote",
  },
}

interface Props {
  searchParams: Promise<{ service?: string }>
}

export default async function QuotePage({ searchParams }: Props) {
  const { service } = await searchParams
  const initialType =
    service === "scanning" ? "SCANNING" : service === "modeling" ? "MODELING" : "MODELING"

  return <QuoteFormClient initialType={initialType} />
}
