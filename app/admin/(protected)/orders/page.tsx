import { prisma } from "@/lib/prisma"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatDate, formatPrice } from "@/lib/utils"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { OrderStatus } from "@/app/generated/prisma/client"

const FILTER_OPTIONS = [
  { value: "all", label: "Все" },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams

  const validStatus = Object.keys(ORDER_STATUS_LABELS).includes(status ?? "")
    ? (status as OrderStatus)
    : undefined

  const orders = await prisma.order.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { files: true } } },
  })

  return (
    <div>
      <h1 className="text-3xl font-black text-[var(--foreground)] mb-6" style={{ fontFamily: "Syne, sans-serif" }}>
        Заказы
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value === "all" ? "/admin/orders" : `/admin/orders?status=${opt.value}`}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              (opt.value === "all" && !status) || status === opt.value
                ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent-border)]"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                {["ID", "Дата", "Клиент", "Материал", "Статус", "Сумма", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 label-mono font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">
                    Заказов нет
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--background)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)] font-mono whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--foreground)]">{order.fullName}</p>
                      <p className="text-xs text-[var(--muted)]">{order.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                      {order.material}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={ORDER_STATUS_COLORS[order.status]}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-[var(--foreground)]">
                      {order.estimatedPrice ? formatPrice(order.estimatedPrice) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs text-[var(--accent)] hover:underline"
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
