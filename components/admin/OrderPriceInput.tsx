"use client"

import { useState, useTransition } from "react"
import { updateOrderPrice } from "@/actions/orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  orderId: string
  currentPrice: number | null
}

export function OrderPriceInput({ orderId, currentPrice }: Props) {
  const [value, setValue] = useState(currentPrice?.toString() ?? "")
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const parsed = value.trim() === "" ? null : parseFloat(value.replace(",", "."))
  const isValid = value.trim() === "" || (!isNaN(parsed!) && parsed! >= 0)
  const hasChange = (parsed ?? null) !== currentPrice

  function handleSave() {
    if (!isValid) return
    startTransition(async () => {
      await updateOrderPrice(orderId, parsed)
      setSaved(true)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Input
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(e) => { setValue(e.target.value); setSaved(false) }}
          disabled={isPending}
          placeholder="Введите сумму..."
          className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">
          ₽
        </span>
      </div>
      <Button
        type="button"
        onClick={handleSave}
        disabled={isPending || !isValid || !hasChange}
        className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-(--accent-hover) transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {isPending ? "Сохранение…" : saved ? "Сохранено ✓" : "Сохранить"}
      </Button>
    </div>
  )
}
