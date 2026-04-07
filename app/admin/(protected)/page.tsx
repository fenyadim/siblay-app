import { prisma } from "@/lib/prisma"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function AdminDashboard() {
  const [total, byStatus, recent] = await Promise.all([
    prisma.order.count(),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { files: { take: 1 } },
    }),
  ])

  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count]))

  const STAT_CARDS = [
    { label: "Всего заказов", value: total, color: "text-foreground" },
    { label: "Новых", value: statusMap["NEW"] ?? 0, color: "text-blue-600" },
    { label: "В работе", value: statusMap["IN_PROGRESS"] ?? 0, color: "text-yellow-600" },
    { label: "Готово", value: statusMap["READY"] ?? 0, color: "text-green-600" },
  ]

  return (
    <div>
      <h1 className="text-3xl font-black text-foreground mb-6" style={{ fontFamily: "Syne, sans-serif" }}>
        Дашборд
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <p className="label-mono mb-2">{s.label}</p>
            <p className={`text-4xl font-black ${s.color}`} style={{ fontFamily: "Syne, sans-serif" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-bold text-foreground" style={{ fontFamily: "Syne, sans-serif" }}>
            Последние заказы
          </h2>
          <Link href="/admin/orders" className="text-sm text-accent hover:underline">
            Все заказы →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.length === 0 ? (
            <p className="p-5 text-sm text-muted">Заказов пока нет</p>
          ) : (
            recent.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-background transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{order.fullName}</p>
                  <p className="text-xs text-muted font-mono">{order.material} · {formatDate(order.createdAt)}</p>
                </div>
                <Badge className={ORDER_STATUS_COLORS[order.status]}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
