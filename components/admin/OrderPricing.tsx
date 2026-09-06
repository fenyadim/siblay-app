'use client'

import { useState } from 'react'

import { OrderPriceInput } from '@/components/admin/OrderPriceInput'

interface Props {
  orderId: string
  currentPrice: number | null
}

export function OrderPricing({ orderId, currentPrice }: Props) {
  const [value, setValue] = useState(currentPrice?.toString() ?? '')

  return (
    <div className="space-y-4">
      <OrderPriceInput
        orderId={orderId}
        currentPrice={currentPrice}
        value={value}
        onValueChange={setValue}
      />
    </div>
  )
}
