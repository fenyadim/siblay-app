export const dynamic = "force-dynamic"

import type { Metadata } from "next"

import { QuoteFormClient } from "@/components/quote/QuoteFormClient"

export const metadata: Metadata = {
  title: "3D-моделирование и 3D-сканирование в Иркутске",
  description:
    "Заявка на 3D-моделирование по эскизам или фото, 3D-сканирование объектов и реверс-инжиниринг в Иркутске. Менеджер свяжется в течение 2 часов.",
  alternates: { canonical: "/quote" },
  openGraph: {
    title: "3D-моделирование и 3D-сканирование в Иркутске — Siblay",
    description:
      "Моделирование по эскизам, фото и чертежам; 3D-сканирование объектов и реверс-инжиниринг в Иркутске.",
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
