'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { createReview, deleteReview, updateReview } from '@/actions/reviews'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatReviewDate } from '@/lib/reviews'
import { type ReviewFormData, reviewSchema } from '@/lib/validations/review'

interface ReviewListItem {
  id: string
  authorName: string
  reviewDate: string
  rating: number
  text: string
  sourceUrl?: string
  published: boolean
  updatedAt: string
}

interface Props {
  items: ReviewListItem[]
}

/* ── Form ─────────────────────────────────────────────────────────────── */

function ReviewForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: {
  defaultValues?: {
    authorName?: string
    reviewDate?: string
    rating?: number
    text?: string
    sourceUrl?: string
    published?: boolean
  }
  onSubmit: (data: ReviewFormData) => void
  onCancel: () => void
  isPending: boolean
}) {
  const initialDate = defaultValues?.reviewDate
    ? new Date(defaultValues.reviewDate).toISOString().slice(0, 10)
    : ''

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema) as Resolver<ReviewFormData>,
    defaultValues: {
      authorName: defaultValues?.authorName ?? '',
      rating: defaultValues?.rating ?? 5,
      text: defaultValues?.text ?? '',
      sourceUrl: defaultValues?.sourceUrl ?? '',
      published: defaultValues?.published ?? true,
      reviewDate: initialDate ? new Date(initialDate) : undefined,
    },
  })

  const rating = watch('rating') ?? 5
  const published = watch('published')

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted mb-1">Имя автора *</label>
          <Input
            {...register('authorName')}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {errors.authorName && (
            <p className="text-xs text-red-500 mt-1">{errors.authorName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">Дата отзыва *</label>
          <Input
            type="date"
            defaultValue={initialDate}
            {...register('reviewDate', { valueAsDate: true })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {errors.reviewDate && (
            <p className="text-xs text-red-500 mt-1">{errors.reviewDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted mb-1">Оценка *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = n <= Number(rating)
            return (
              <button
                key={n}
                type="button"
                onClick={() => setValue('rating', n, { shouldDirty: true, shouldValidate: true })}
                className={`text-2xl leading-none ${active ? 'text-amber-500' : 'text-border'}`}
                aria-label={`${n} из 5`}
              >
                ★
              </button>
            )
          })}
        </div>
        {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>}
      </div>

      <div>
        <label className="block text-xs text-muted mb-1">Текст отзыва *</label>
        <Textarea
          {...register('text')}
          rows={5}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
        {errors.text && <p className="text-xs text-red-500 mt-1">{errors.text.message}</p>}
      </div>

      <div>
        <label className="block text-xs text-muted mb-1">
          Ссылка на отзыв на Avito (необязательно)
        </label>
        <Input
          {...register('sourceUrl')}
          placeholder="https://www.avito.ru/..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {errors.sourceUrl && (
          <p className="text-xs text-red-500 mt-1">{errors.sourceUrl.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="published"
          checked={Boolean(published)}
          onCheckedChange={(checked) =>
            setValue('published', Boolean(checked), {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <label htmlFor="published" className="text-sm text-foreground">
          Опубликовано
        </label>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-(--accent-hover) transition-colors disabled:opacity-50"
        >
          {isPending ? 'Сохранение…' : 'Сохранить'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-border text-sm text-muted hover:text-foreground transition-colors"
        >
          Отмена
        </Button>
      </div>
    </form>
  )
}

/* ── Admin Client ─────────────────────────────────────────────────────── */

export function ReviewsAdminClient({ items: initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const editingItem = items.find((i) => i.id === editingId)

  function handleCreate(data: ReviewFormData) {
    setError(null)
    startTransition(async () => {
      const result = await createReview(data)
      if ('error' in result) {
        setError(result.error ?? 'Неизвестная ошибка')
        return
      }
      setItems((prev) => [
        {
          id: result.review.id,
          authorName: result.review.authorName,
          reviewDate: result.review.reviewDate.toISOString(),
          rating: result.review.rating,
          text: result.review.text,
          sourceUrl: result.review.sourceUrl ?? undefined,
          published: result.review.published,
          updatedAt: result.review.updatedAt.toISOString(),
        },
        ...prev,
      ])
      setMode('list')
      toast.success('Отзыв добавлен')
    })
  }

  function handleUpdate(data: ReviewFormData) {
    if (!editingId) return
    setError(null)
    startTransition(async () => {
      const result = await updateReview(editingId, data)
      if ('error' in result) {
        setError(result.error ?? 'Неизвестная ошибка')
        return
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                id: result.review.id,
                authorName: result.review.authorName,
                reviewDate: result.review.reviewDate.toISOString(),
                rating: result.review.rating,
                text: result.review.text,
                sourceUrl: result.review.sourceUrl ?? undefined,
                published: result.review.published,
                updatedAt: result.review.updatedAt.toISOString(),
              }
            : item
        )
      )
      setMode('list')
      setEditingId(null)
      toast.success('Отзыв обновлён')
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Удалить отзыв?')) return
    startTransition(async () => {
      await deleteReview(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast.success('Отзыв удалён')
    })
  }

  return (
    <div>
      {mode === 'list' && (
        <>
          <div className="mb-4">
            <Button
              type="button"
              onClick={() => {
                setMode('create')
                setError(null)
              }}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-(--accent-hover) transition-colors"
            >
              + Добавить отзыв
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
              Отзывов пока нет
            </div>
          ) : (
            <div className="admin-table-wrapper rounded-xl border border-border bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table role="table" className="admin-table w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background">
                      {['Автор', 'Оценка', 'Дата отзыва', 'Статус', 'Обновлён', ''].map((h) => (
                        <th key={h} className="text-left px-4 py-3 label-mono font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-background transition-colors">
                        <td data-label="Автор" className="px-4 py-3 font-medium text-foreground">
                          {item.authorName}
                        </td>
                        <td data-label="Оценка" className="px-4 py-3 text-amber-500 font-mono">
                          {'★'.repeat(item.rating)}
                          <span className="text-border">{'★'.repeat(5 - item.rating)}</span>
                        </td>
                        <td
                          data-label="Дата отзыва"
                          className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap"
                        >
                          {formatReviewDate(item.reviewDate)}
                        </td>
                        <td data-label="Статус" className="px-4 py-3">
                          <Badge
                            className={
                              item.published
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-surface text-muted border border-border'
                            }
                          >
                            {item.published ? 'Опубликовано' : 'Скрыто'}
                          </Badge>
                        </td>
                        <td
                          data-label="Обновлён"
                          className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap"
                        >
                          {new Date(item.updatedAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingId(item.id)
                                setMode('edit')
                                setError(null)
                              }}
                              className="text-xs text-accent hover:bg-transparent hover:underline"
                            >
                              Изменить
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              disabled={isPending}
                              className="text-xs text-red-500 hover:bg-transparent hover:underline disabled:opacity-50"
                            >
                              Удалить
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {(mode === 'create' || mode === 'edit') && (
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-5 font-display">
            {mode === 'create' ? 'Новый отзыв' : 'Редактировать отзыв'}
          </h2>

          {error && (
            <p className="text-sm text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </p>
          )}

          <ReviewForm
            defaultValues={
              editingItem
                ? {
                    authorName: editingItem.authorName,
                    reviewDate: editingItem.reviewDate,
                    rating: editingItem.rating,
                    text: editingItem.text,
                    sourceUrl: editingItem.sourceUrl,
                    published: editingItem.published,
                  }
                : undefined
            }
            onSubmit={mode === 'create' ? handleCreate : handleUpdate}
            onCancel={() => {
              setMode('list')
              setEditingId(null)
              setError(null)
            }}
            isPending={isPending}
          />
        </div>
      )}
    </div>
  )
}
