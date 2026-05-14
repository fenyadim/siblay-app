import Link from "next/link"

import { FormattedDate } from "@/components/admin/FormattedDate"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  QUOTE_STATUS_COLORS,
  QUOTE_STATUS_LABELS,
  QUOTE_TYPE_LABELS,
} from "@/lib/utils"

export default async function AdminDashboard() {
  const [
    orderTotal,
    ordersByStatus,
    recentOrders,
    quoteTotal,
    quotesByStatus,
    recentQuotes,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { files: { take: 1 } },
    }),
    prisma.quote.count(),
    prisma.quote.groupBy({ by: ["status"], _count: true }),
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  const orderStatusMap = Object.fromEntries(
    ordersByStatus.map((s) => [s.status, s._count]),
  )
  const quoteStatusMap = Object.fromEntries(
    quotesByStatus.map((s) => [s.status, s._count]),
  )

  const ORDER_STAT_CARDS = [
    { label: "Всего заказов", value: orderTotal, color: "text-foreground" },
    { label: "Новых", value: orderStatusMap["NEW"] ?? 0, color: "text-blue-600" },
    { label: "В работе", value: orderStatusMap["IN_PROGRESS"] ?? 0, color: "text-yellow-600" },
    { label: "Готово", value: orderStatusMap["READY"] ?? 0, color: "text-green-600" },
  ]

  const QUOTE_STAT_CARDS = [
    { label: "Всего заявок", value: quoteTotal, color: "text-foreground" },
    { label: "Новых", value: quoteStatusMap["NEW"] ?? 0, color: "text-blue-600" },
    { label: "На рассмотрении", value: quoteStatusMap["IN_REVIEW"] ?? 0, color: "text-amber-600" },
    { label: "Оценено", value: quoteStatusMap["QUOTED"] ?? 0, color: "text-purple-600" },
  ]

  return (
    <div>
      <h1 className="text-3xl font-black text-foreground mb-6 font-display">
        Дашборд
      </h1>

      {/* ── Заказы ─────────────────────────────────────────── */}
      <h2 className="text-xl font-bold text-foreground mb-4 font-display">
        Заказы
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {ORDER_STAT_CARDS.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <p className="label-mono mb-2">{s.label}</p>
            <p className={`text-4xl font-black ${s.color} font-display`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface mb-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground font-display">
            Последние заказы
          </h3>
          <Link href="/admin/orders" className="text-sm text-accent hover:underline">
            Все заказы →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.length === 0 ? (
            <p className="p-5 text-sm text-muted">Заказов пока нет</p>
          ) : (
            recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-background transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{order.fullName}</p>
                  <p className="text-xs text-muted font-mono">
                    {order.material} · <FormattedDate date={order.createdAt} />
                  </p>
                </div>
                <Badge className={ORDER_STATUS_COLORS[order.status]}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ── Заявки ─────────────────────────────────────────── */}
      <h2 className="text-xl font-bold text-foreground mb-4 font-display">
        Заявки
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {QUOTE_STAT_CARDS.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <p className="label-mono mb-2">{s.label}</p>
            <p className={`text-4xl font-black ${s.color} font-display`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground font-display">
            Последние заявки
          </h3>
          <Link href="/admin/quotes" className="text-sm text-accent hover:underline">
            Все заявки →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentQuotes.length === 0 ? (
            <p className="p-5 text-sm text-muted">Заявок пока нет</p>
          ) : (
            recentQuotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/admin/quotes/${quote.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-background transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{quote.fullName}</p>
                  <p className="text-xs text-muted font-mono">
                    {QUOTE_TYPE_LABELS[quote.type]} · <FormattedDate date={quote.createdAt} />
                  </p>
                </div>
                <Badge className={QUOTE_STATUS_COLORS[quote.status]}>
                  {QUOTE_STATUS_LABELS[quote.status]}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
