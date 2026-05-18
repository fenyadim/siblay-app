"use client"

import { useState } from "react"

import { CostCalculator } from "@/components/admin/CostCalculator"
import { OrderPriceInput } from "@/components/admin/OrderPriceInput"
import type { OrderDimensions } from "@/lib/pricing"

interface Props {
  orderId: string
  currentPrice: number | null
  orderParams: OrderDimensions
}

export function OrderPricing({ orderId, currentPrice, orderParams }: Props) {
  const [value, setValue] = useState(currentPrice?.toString() ?? "")

  return (
    <div className="space-y-4">
      <OrderPriceInput
        orderId={orderId}
        currentPrice={currentPrice}
        value={value}
        onValueChange={setValue}
      />
      <CostCalculator
        orderParams={orderParams}
        onApply={(total) => setValue(String(total))}
      />
    </div>
  )
}
