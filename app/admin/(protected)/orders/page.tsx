import Link from 'next/link'

import { OrderStatus, type QuoteStatus } from '@/app/generated/prisma/client'
import { FormattedDate } from '@/components/admin/FormattedDate'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import {
  formatPrice,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  QUOTE_STATUS_COLORS,
  QUOTE_STATUS_LABELS,
} from '@/lib/utils'

// Legacy requests keep their original statuses; filters group their workflow stages.
const QUOTE_FILTERS: Record<OrderStatus, QuoteStatus[]> = {
  NEW: ['NEW'],
  IN_PROGRESS: ['IN_REVIEW', 'QUOTED', 'ACCEPTED'],
  READY: [],
  DELIVERED: [],
  CANCELLED: ['REJECTED'],
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'Все' },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
]

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status } = await searchParams

  const validStatus = Object.keys(ORDER_STATUS_LABELS).includes(status ?? '')
    ? (status as OrderStatus)
    : undefined

  const [printOrders, quotes] = await Promise.all([
    prisma.order.findMany({
      where: validStatus ? { status: validStatus } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { files: true } } },
    }),
    prisma.quote.findMany({
      where: validStatus ? { status: { in: QUOTE_FILTERS[validStatus] } } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { files: true } } },
    }),
  ])
  const orders = [
    ...printOrders.map((order) => ({
      ...order,
      href: `/admin/orders/${order.id}`,
      statusLabel: ORDER_STATUS_LABELS[order.status],
      statusColor: ORDER_STATUS_COLORS[order.status],
    })),
    ...quotes.map((quote) => ({
      ...quote,
      comment: quote.description,
      href: `/admin/quotes/${quote.id}`,
      statusLabel: QUOTE_STATUS_LABELS[quote.status],
      statusColor: QUOTE_STATUS_COLORS[quote.status],
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return (
    <div>
      <h1 className="text-3xl font-black text-foreground mb-6 font-display">Заказы</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value === 'all' ? '/admin/orders' : `/admin/orders?status=${opt.value}`}
            className={`inline-flex min-h-11 items-center px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              (opt.value === 'all' && !validStatus) || validStatus === opt.value
                ? 'bg-accent border-accent text-white'
                : 'border-border text-muted hover:border-(--accent-border)'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="admin-table-wrapper rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table role="table" className="admin-table w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                {['Дата', 'Клиент', 'Описание заказа', 'Статус', 'Сумма', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 label-mono font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    Заказов нет
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.href} className="hover:bg-background transition-colors">
                    <td
                      data-label="Дата"
                      className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap"
                    >
                      <FormattedDate date={order.createdAt} />
                    </td>
                    <td data-label="Клиент" className="px-4 py-3">
                      <p className="font-medium text-foreground">{order.fullName}</p>
                      <a href={`tel:${order.phone}`} className="text-xs text-accent">
                        {order.phone}
                      </a>
                    </td>
                    <td
                      data-label="Описание заказа"
                      className="px-4 py-3 text-xs text-foreground max-w-72"
                    >
                      <p className="line-clamp-2 break-words">{order.comment || 'Без описания'}</p>
                      {order._count.files > 0 && (
                        <p className="mt-1 text-muted">Файлов: {order._count.files}</p>
                      )}
                    </td>
                    <td data-label="Статус" className="px-4 py-3">
                      <Badge className={order.statusColor}>{order.statusLabel}</Badge>
                    </td>
                    <td data-label="Сумма" className="px-4 py-3 font-mono text-sm text-foreground">
                      {order.estimatedPrice != null
                        ? formatPrice(order.estimatedPrice)
                        : 'Не указана'}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={order.href} className="text-xs text-accent hover:underline">
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
