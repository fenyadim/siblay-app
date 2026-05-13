"use client"

import { useState, useTransition } from "react"

import { QuoteStatus } from "@/app/generated/prisma/client"
import { updateQuoteStatus } from "@/actions/quotes"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QUOTE_STATUS_LABELS } from "@/lib/utils"

interface Props {
  quoteId: string
  currentStatus: QuoteStatus
}

export function QuoteStatusSelect({ quoteId, currentStatus }: Props) {
  const [status, setStatus] = useState<QuoteStatus>(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleChange(value: string) {
    setStatus(value as QuoteStatus)
    setSaved(false)
  }

  function handleSave() {
    startTransition(async () => {
      await updateQuoteStatus(quoteId, status)
      setSaved(true)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={status} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="flex-1 rounded-lg border-border bg-background text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        onClick={handleSave}
        disabled={isPending || status === currentStatus}
        className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-(--accent-hover) transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? "Сохранение…" : saved ? "Сохранено ✓" : "Сохранить"}
      </Button>
    </div>
  )
}
