import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatDate, formatPrice, formatFileSize } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect"
import { OrderPriceInput } from "@/components/admin/OrderPriceInput"
import { OrderStatus } from "@/app/generated/prisma/client"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { files: true },
  })

  if (!order) notFound()

  const DETAILS = [
    { label: "Материал", value: `${order.material} · ${order.color}` },
    { label: "Размеры", value: `${order.length}×${order.width}×${order.height} мм` },
    { label: "Количество", value: `${order.quantity} шт.` },
    { label: "Заполнение", value: `${order.infill}%` },
    { label: "Есть модель", value: order.hasModel ? "Да" : "Нет (требует моделирования)" },
    { label: "Доставка", value: order.delivery },
    ...(order.address ? [{ label: "Адрес", value: order.address }] : []),
  ]

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/admin/orders" className="hover:text-[var(--accent)] transition-colors">Заказы</Link>
        <span>/</span>
        <span className="font-mono">{id.slice(0, 8)}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-[var(--foreground)]" style={{ fontFamily: "Syne, sans-serif" }}>
            {order.fullName}
          </h1>
          <p className="text-sm text-[var(--muted)] font-mono mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <Badge className={`${ORDER_STATUS_COLORS[order.status]} text-sm px-3 py-1`}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {/* Status change */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 mb-4">
        <p className="label-mono mb-3">Изменить статус</p>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status as OrderStatus} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Contact info */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="label-mono mb-3">Контакты</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Телефон</span>
              <a href={`tel:${order.phone}`} className="font-mono text-[var(--accent)]">{order.phone}</a>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Email</span>
              <a href={`mailto:${order.email}`} className="font-mono text-[var(--accent)] truncate max-w-[180px]">{order.email}</a>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="label-mono mb-3">Стоимость</p>
          {order.estimatedPrice && (
            <p className="text-3xl font-black text-[var(--accent)] mb-3" style={{ fontFamily: "Syne, sans-serif" }}>
              {formatPrice(order.estimatedPrice)}
            </p>
          )}
          {!order.hasModel && (
            <p className="text-xs text-[var(--muted)] mb-3">Включает моделирование</p>
          )}
          <OrderPriceInput orderId={order.id} currentPrice={order.estimatedPrice} />
        </div>
      </div>

      {/* Print details */}
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="label-mono mb-3">Параметры печати</p>
        <div className="grid grid-cols-2 gap-3">
          {DETAILS.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-[var(--muted)]">{label}</span>
              <span className="text-sm font-medium text-[var(--foreground)]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comment */}
      {order.comment && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="label-mono mb-2">Комментарий</p>
          <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">{order.comment}</p>
        </div>
      )}

      {/* Files */}
      {order.files.length > 0 && (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="label-mono mb-3">Файлы ({order.files.length})</p>
          <div className="space-y-2">
            {order.files.map((f) => (
              <a
                key={f.id}
                href={f.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent-border)] transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-[var(--accent-subtle)] flex items-center justify-center text-xs font-mono text-[var(--accent)] shrink-0">
                  {f.fileName.split(".").pop()?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{f.fileName}</p>
                  <p className="text-xs text-[var(--muted)]">{formatFileSize(f.fileSize)}</p>
                </div>
                <svg className="text-[var(--accent)] shrink-0" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
