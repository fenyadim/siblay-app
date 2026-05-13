import Link from "next/link"

import { QuoteStatus } from "@/app/generated/prisma/client"
import { Badge } from "@/components/ui/badge"
import { FormattedDate } from "@/components/admin/FormattedDate"
import { prisma } from "@/lib/prisma"
import {
  QUOTE_STATUS_COLORS,
  QUOTE_STATUS_LABELS,
  QUOTE_TYPE_LABELS,
  formatPrice,
} from "@/lib/utils"

const FILTER_OPTIONS = [
  { value: "all", label: "Все" },
  ...Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminQuotesPage({ searchParams }: Props) {
  const { status } = await searchParams

  const validStatus = Object.keys(QUOTE_STATUS_LABELS).includes(status ?? "")
    ? (status as QuoteStatus)
    : undefined

  const quotes = await prisma.quote.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { files: true } } },
  })

  return (
    <div>
      <h1 className="text-3xl font-black text-foreground mb-6 font-display">Заявки</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value === "all" ? "/admin/quotes" : `/admin/quotes?status=${opt.value}`}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              (opt.value === "all" && !status) || status === opt.value
                ? "bg-accent border-accent text-white"
                : "border-border text-muted hover:border-(--accent-border)"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                {["ID", "Дата", "Клиент", "Услуга", "Статус", "Сумма", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 label-mono font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted">
                    Заявок нет
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-background transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {quote.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap">
                      <FormattedDate date={quote.createdAt} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{quote.fullName}</p>
                      <p className="text-xs text-muted">{quote.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">
                      {QUOTE_TYPE_LABELS[quote.type] ?? quote.type}
                      {quote.type === "SCANNING" && quote.needsReverse && (
                        <span className="block text-[10px] text-accent mt-0.5">+ реверс</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={QUOTE_STATUS_COLORS[quote.status]}>
                        {QUOTE_STATUS_LABELS[quote.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-foreground">
                      {quote.estimatedPrice ? formatPrice(quote.estimatedPrice) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/quotes/${quote.id}`}
                        className="text-xs text-accent hover:underline"
                      >
                        Открыть →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
