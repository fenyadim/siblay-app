export const dynamic = "force-dynamic"

import type { Metadata } from "next"

import { getMaterialsWithColors } from "@/actions/materials"
import { getSeedMaterialsPreview } from "@/actions/materials"
import { OrderFormClient } from "@/components/order/OrderFormClient"

export const metadata: Metadata = {
  title: "Заказать 3D-печать в Иркутске",
  description:
    "Закажите 3D-печать в Иркутске онлайн. Загрузите модель или фотографии, выберите материал и цвет, рассчитайте стоимость автоматически.",
  alternates: { canonical: "/order" },
  openGraph: {
    title: "Заказать 3D-печать в Иркутске — Siblay",
    description:
      "Загрузите модель или фотографии, выберите материал и цвет, рассчитайте стоимость онлайн.",
    url: "/order",
  },
}

export default async function OrderPage() {
  const materials = await getMaterialsWithColors()
  const availableMaterials = materials.length > 0 ? materials : await getSeedMaterialsPreview()
  return <OrderFormClient materials={availableMaterials} />
}
