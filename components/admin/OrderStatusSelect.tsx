"use client"

import { useState, useTransition } from "react"
import { OrderStatus } from "@/app/generated/prisma/client"
import { ORDER_STATUS_LABELS } from "@/lib/utils"
import { updateOrderStatus } from "@/actions/orders"

interface Props {
  orderId: string
  currentStatus: OrderStatus
}

export function OrderStatusSelect({ orderId, currentStatus }: Props) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setStatus(e.target.value as OrderStatus)
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await updateOrderStatus(orderId, status)
      setSaved(true)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        className="flex-1 rounded-lg border border-border bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50"
      >
        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={isPending || status === currentStatus}
        className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-(--accent-hover) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Сохранение…" : saved ? "Сохранено ✓" : "Сохранить"}
      </button>
    </div>
  )
}
