"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { deleteQuote } from "@/actions/quotes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Props {
  quoteId: string
  customerName: string
}

export function DeleteQuoteButton({ quoteId, customerName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      try {
        await deleteQuote(quoteId)
        setOpen(false)
        router.replace("/admin/quotes")
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка при удалении")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
        >
          Удалить заявку
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить заявку?</DialogTitle>
          <DialogDescription>
            Заявка клиента <span className="font-medium text-foreground">{customerName}</span>{" "}
            будет удалена вместе с прикреплёнными файлами. Действие необратимо.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Отмена
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
          >
            {isPending ? "Удаление…" : "Удалить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
