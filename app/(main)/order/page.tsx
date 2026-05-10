export const dynamic = "force-dynamic"

import type { Metadata } from "next"

import { getMaterialsWithColors } from "@/actions/materials"
import { getSeedMaterialsPreview } from "@/actions/materials"
import { OrderFormClient } from "@/components/order/OrderFormClient"

export const metadata: Metadata = {
  title: "Оформить заказ на 3D-печать",
  description:
    "Оформите заказ на 3D-печать онлайн. Загрузите модель или фотографии, выберите материал и цвет, рассчитайте стоимость автоматически.",
  alternates: { canonical: "/order" },
  openGraph: {
    title: "Оформить заказ на 3D-печать — Siblay",
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
