export const dynamic = "force-dynamic"

import { getMaterialsWithColors } from "@/actions/materials"
import { OrderFormClient } from "@/components/order/OrderFormClient"

export default async function OrderPage() {
  const materials = await getMaterialsWithColors()
  return <OrderFormClient materials={materials} />
}
