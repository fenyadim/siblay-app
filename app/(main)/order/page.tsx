export const dynamic = "force-dynamic"

import { getMaterialsWithColors } from "@/actions/materials"
import { getSeedMaterialsPreview } from "@/actions/materials"
import { OrderFormClient } from "@/components/order/OrderFormClient"

export default async function OrderPage() {
  const materials = await getMaterialsWithColors()
  const availableMaterials = materials.length > 0 ? materials : await getSeedMaterialsPreview()
  return <OrderFormClient materials={availableMaterials} />
}
