import Link from 'next/link'
import { notFound } from 'next/navigation'

import { QuoteStatus } from '@/app/generated/prisma/client'
import { DeleteQuoteButton } from '@/components/admin/DeleteQuoteButton'
import { FormattedDate } from '@/components/admin/FormattedDate'
import { QuotePriceInput } from '@/components/admin/QuotePriceInput'
import { QuoteStatusSelect } from '@/components/admin/QuoteStatusSelect'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'
import {
  formatFileSize,
  formatPrice,
  MODELING_SOURCE_LABELS,
  QUOTE_STATUS_COLORS,
  QUOTE_STATUS_LABELS,
  QUOTE_TYPE_LABELS,
  SCAN_LOCATION_LABELS,
} from '@/lib/utils'

function telegramHref(value: string): string {
  const v = value.trim()
  if (/^https?:\/\//i.test(v)) return v
  if (v.startsWith('@')) return `https://t.me/${v.slice(1)}`
  if (/^t\.me\//i.test(v)) return `https://${v}`
  return `https://t.me/${v.replace(/^\/+/, '')}`
}

function TelegramLink({ value }: { value: string }) {
  return (
    <a
      href={telegramHref(value)}
      target="_blank"
      rel="noopener noreferrer"
      className="min-w-0 max-w-full break-all font-mono text-accent py-2"
    >
      {value}
    </a>
  )
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminQuoteDetailPage({ params }: Props) {
  const { id } = await params
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { files: true },
  })

  if (!quote) notFound()

  const dims = [quote.objectLength, quote.objectWidth, quote.objectHeight]
  const hasDims = dims.every((v) => typeof v === 'number' && v !== null)

  const details: Array<{ label: string; value: string }> = [
    { label: 'Тип услуги', value: QUOTE_TYPE_LABELS[quote.type] ?? quote.type },
  ]

  if (quote.type === 'MODELING' && quote.sourceType) {
    details.push({
      label: 'Тип исходника',
      value: MODELING_SOURCE_LABELS[quote.sourceType] ?? quote.sourceType,
    })
  }

  if (quote.type === 'SCANNING') {
    if (hasDims) {
      details.push({
        label: 'Габариты объекта',
        value: `${dims[0]}×${dims[1]}×${dims[2]} мм`,
      })
    }
    if (quote.location) {
      details.push({
        label: 'Расположение',
        value: SCAN_LOCATION_LABELS[quote.location] ?? quote.location,
      })
    }
    details.push({
      label: 'Реверс-инжиниринг',
      value: quote.needsReverse ? 'Да' : 'Нет',
    })
  }

  if (quote.desiredFormat) {
    details.push({ label: 'Желаемый формат', value: quote.desiredFormat })
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link href="/admin/orders" className="hover:text-accent transition-colors">
          Заказы
        </Link>
        <span>/</span>
        <span className="font-mono">{id.slice(0, 8)}</span>
      </div>

      <div className="flex flex-col items-start gap-3 mb-6 sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground font-display">{quote.fullName}</h1>
          <FormattedDate
            date={quote.createdAt}
            className="text-sm text-muted font-mono mt-1 block"
          />
        </div>
        <Badge className={`${QUOTE_STATUS_COLORS[quote.status]} text-sm px-3 py-1`}>
          {QUOTE_STATUS_LABELS[quote.status]}
        </Badge>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 mb-4">
        <p className="label-mono mb-3">Изменить статус</p>
        <QuoteStatusSelect quoteId={quote.id} currentStatus={quote.status as QuoteStatus} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 mb-4">
        <p className="label-mono mb-2">Описание заказа</p>
        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
          {quote.description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <p className="label-mono mb-3">Контакты</p>
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="text-muted">Телефон</span>
              <a
                href={`tel:${quote.phone}`}
                className="min-w-0 break-all py-2 font-mono text-accent"
              >
                {quote.phone}
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <span className="text-muted">Email</span>
              <a href={`mailto:${quote.email}`} className="font-mono text-accent truncate max-w-45">
                {quote.email}
              </a>
            </div>
            {quote.telegram && (
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className="text-muted">Telegram</span>
                <TelegramLink value={quote.telegram} />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <p className="label-mono mb-3">Стоимость</p>
          {quote.estimatedPrice != null && (
            <p className="text-3xl font-black text-accent mb-3 font-display">
              {formatPrice(quote.estimatedPrice)}
            </p>
          )}
          <QuotePriceInput quoteId={quote.id} currentPrice={quote.estimatedPrice} />
        </div>
      </div>

      <details className="mt-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
        <summary className="cursor-pointer text-sm text-muted">Параметры из прежней формы</summary>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {details.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-muted">{label}</span>
              <span className="text-sm font-medium text-foreground break-words">{value}</span>
            </div>
          ))}
        </div>
      </details>

      {quote.files.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <p className="label-mono mb-3">Файлы ({quote.files.length})</p>
          <div className="space-y-2">
            {quote.files.map((f) => (
              <a
                key={f.id}
                href={f.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-(--accent-border) transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-(--accent-subtle) flex items-center justify-center text-xs font-mono text-accent shrink-0">
                  {f.fileName.split('.').pop()?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.fileName}</p>
                  <p className="text-xs text-muted">{formatFileSize(f.fileSize)}</p>
                </div>
                <svg
                  className="text-accent shrink-0"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end border-t border-border pt-4">
        <DeleteQuoteButton quoteId={quote.id} customerName={quote.fullName} />
      </div>
    </div>
  )
}
