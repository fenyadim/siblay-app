# Avito Reviews on Homepage — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить публичную секцию «Отзывы клиентов» (слайдер) на главной с админ-CRUD'ом для отзывов и SEO-разметкой (`AggregateRating` + `Review`).

**Architecture:** Новая Prisma-модель `Review`. Чистые утилиты в `lib/reviews.ts` (форматер даты, цвет аватарки, среднее, JSON-LD-фрагмент) — покрыты Vitest по TDD. Server actions в `actions/reviews.ts` (по образцу `actions/portfolio.ts`). Админ-страница `/admin/reviews` — список+форма в одном файле через клиентский `ReviewsAdminClient` (по образцу `PortfolioAdminClient`). Публичная секция — server-component `ReviewsSection` + client-`ReviewsCarousel` на `embla-carousel-react`. JSON-LD-фрагмент с `aggregateRating`+`review` встраивается отдельным `<script>` с тем же `@id`, что глобальный `LocalBusiness` (Schema.org мержит блоки по `@id`).

**Tech Stack:** Next.js 16 (App Router), Prisma 7 (Postgres, `db push` без миграций), Zod 4, React Hook Form, embla-carousel-react/-autoplay, Vitest 4, Tailwind 4, lucide-react, sonner, Better Auth.

**Файловая структура** (всё к созданию, если не указано иное):

| Файл | Назначение |
|------|------------|
| `prisma/schema.prisma` | + модель `Review` (modify) |
| `lib/reviews.ts` | Чистые утилиты: `formatReviewDate`, `avatarColor`, `averageRating`, `buildReviewsJsonLdForLocalBusiness`, константа `AVATAR_PALETTE` |
| `lib/reviews.test.ts` | Vitest на эти утилиты |
| `lib/validations/review.ts` | Zod-схема `reviewSchema` + type `ReviewFormData` |
| `actions/reviews.ts` | Server actions: `getPublishedReviews`, `getAllReviews`, `createReview`, `updateReview`, `deleteReview` |
| `components/admin/ReviewsAdminClient.tsx` | Клиентский SPA-блок: список+форма, использует server actions через `useTransition` |
| `app/admin/(protected)/reviews/page.tsx` | Server-обёртка: фетчит `getAllReviews()` и передаёт в клиент |
| `components/admin/AdminSidebar.tsx` | + пункт «Отзывы» в `NAV` (modify) |
| `components/landing/ReviewCard.tsx` | Презентационная карточка отзыва |
| `components/landing/ReviewsCarousel.tsx` | Client-компонент: embla-слайдер |
| `components/landing/ReviewsSection.tsx` | Server-component: фетч `getPublishedReviews()` + рендер заголовка, карусели и `<script type="application/ld+json">` |
| `app/(main)/page.tsx` | Вставка `<ReviewsSection />` между `PortfolioPreviewSection` и `MaterialsSection` (modify) |

---

### Task 1: Prisma-модель `Review` + синхронизация БД

**Files:**
- Modify: `prisma/schema.prisma:147` (вставить новую модель после `MaterialColor`, перед блоком Better Auth моделей)

- [ ] **Step 1: Добавить модель в схему**

В файле `prisma/schema.prisma` после строки 147 (после блока `MaterialColor`) и **перед** комментарием `// Better Auth required models` вставить:

```prisma
model Review {
  id         String   @id @default(cuid())
  authorName String
  reviewDate DateTime
  rating     Int
  text       String
  sourceUrl  String?
  published  Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([published, reviewDate])
}
```

- [ ] **Step 2: Сгенерировать клиент и синхронизировать БД**

Run: `pnpm db:push && pnpm db:generate`
Expected: вывод «Your database is now in sync with your Prisma schema» и «Generated Prisma Client». Тип `Review` появится в `app/generated/prisma/client`.

- [ ] **Step 3: Убедиться, что тип импортируется**

Run: `pnpm typecheck`
Expected: PASS (генерация прошла, нового кода ещё нет — ничего не должно сломаться).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma app/generated/prisma
git commit -m "feat(reviews): добавить модель Review для отзывов клиентов"
```

---

### Task 2: Чистые утилиты `lib/reviews.ts` (TDD)

**Files:**
- Create: `lib/reviews.test.ts`
- Create: `lib/reviews.ts`

- [ ] **Step 1: Написать падающий тест**

Создать `lib/reviews.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import {
  AVATAR_PALETTE,
  averageRating,
  avatarColor,
  buildReviewsJsonLdForLocalBusiness,
  formatReviewDate,
} from './reviews'

describe('formatReviewDate', () => {
  it('форматирует дату в "13 мая 2026" для русской локали', () => {
    expect(formatReviewDate(new Date('2026-05-13T00:00:00Z'))).toBe('13 мая 2026 г.')
  })

  it('принимает строку ISO', () => {
    expect(formatReviewDate('2026-05-13')).toBe('13 мая 2026 г.')
  })
})

describe('avatarColor', () => {
  it('детерминирован: одно имя → один цвет', () => {
    expect(avatarColor('Наталья')).toBe(avatarColor('Наталья'))
  })

  it('возвращает цвет из палитры', () => {
    expect(AVATAR_PALETTE).toContain(avatarColor('Наталья'))
  })

  it('обрабатывает пустую строку', () => {
    expect(AVATAR_PALETTE).toContain(avatarColor(''))
  })

  it('распределяет разные имена', () => {
    const colors = new Set(['Анна', 'Борис', 'Виктор', 'Галина', 'Дмитрий'].map(avatarColor))
    expect(colors.size).toBeGreaterThan(1)
  })
})

describe('averageRating', () => {
  it('считает среднее с одним знаком после запятой', () => {
    expect(averageRating([5, 5, 4, 5, 3])).toBe(4.4)
  })

  it('возвращает null для пустого массива', () => {
    expect(averageRating([])).toBeNull()
  })

  it('возвращает 5 для всех пятёрок', () => {
    expect(averageRating([5, 5, 5])).toBe(5)
  })
})

describe('buildReviewsJsonLdForLocalBusiness', () => {
  const siteUrl = 'https://siblay.ru'

  it('возвращает null для пустого массива', () => {
    expect(buildReviewsJsonLdForLocalBusiness([], siteUrl)).toBeNull()
  })

  it('строит фрагмент с aggregateRating и review для одного отзыва', () => {
    const review = {
      authorName: 'Наталья',
      reviewDate: new Date('2026-05-13T00:00:00Z'),
      rating: 5,
      text: 'Работа выполнена качественно и в срок. Рекомендую.',
    }

    const fragment = buildReviewsJsonLdForLocalBusiness([review], siteUrl)

    expect(fragment).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}#localbusiness`,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5.0',
        reviewCount: 1,
        bestRating: '5',
        worstRating: '1',
      },
      review: [
        {
          '@type': 'Review',
          author: { '@type': 'Person', name: 'Наталья' },
          datePublished: '2026-05-13',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
            worstRating: '1',
          },
          reviewBody: 'Работа выполнена качественно и в срок. Рекомендую.',
        },
      ],
    })
  })
})
```

- [ ] **Step 2: Запустить тест — должен упасть**

Run: `pnpm test lib/reviews.test.ts`
Expected: FAIL — «Cannot find module './reviews'».

- [ ] **Step 3: Реализовать модуль**

Создать `lib/reviews.ts`:

```ts
/**
 * Чистые утилиты для секции отзывов: форматер даты, детерминированный
 * цвет аватарки и фрагмент Schema.org-разметки, объединяемый с глобальным
 * LocalBusiness JSON-LD по совпадающему `@id`.
 */

export const AVATAR_PALETTE = [
  '#0ea5e9', // sky-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
] as const

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatReviewDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  return dateFormatter.format(date)
}

export function avatarColor(name: string): string {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length]
}

export function averageRating(ratings: readonly number[]): number | null {
  if (ratings.length === 0) return null
  const sum = ratings.reduce((acc, r) => acc + r, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

export interface ReviewForJsonLd {
  authorName: string
  reviewDate: Date
  rating: number
  text: string
}

export function buildReviewsJsonLdForLocalBusiness(
  reviews: readonly ReviewForJsonLd[],
  siteUrl: string,
): Record<string, unknown> | null {
  if (reviews.length === 0) return null
  const avg = averageRating(reviews.map((r) => r.rating))!
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteUrl}#localbusiness`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length,
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.authorName },
      datePublished: r.reviewDate.toISOString().slice(0, 10),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(r.rating),
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: r.text,
    })),
  }
}
```

- [ ] **Step 4: Запустить тест — должен пройти**

Run: `pnpm test lib/reviews.test.ts`
Expected: PASS, 4 describe-блока, ~11 it зелёные.

- [ ] **Step 5: Commit**

```bash
git add lib/reviews.ts lib/reviews.test.ts
git commit -m "feat(reviews): утилиты форматирования, цвета аватарки и JSON-LD"
```

---

### Task 3: Zod-схема валидации

**Files:**
- Create: `lib/validations/review.ts`

- [ ] **Step 1: Написать схему**

Создать `lib/validations/review.ts`:

```ts
import { z } from 'zod'

export const reviewSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(1, 'Укажите имя автора')
    .max(100, 'Максимум 100 символов'),
  reviewDate: z.coerce
    .date({ error: 'Укажите дату отзыва' })
    .refine((d) => d.getTime() <= Date.now(), 'Дата не может быть в будущем'),
  rating: z.coerce
    .number()
    .int('Оценка — целое число')
    .min(1, 'Минимум 1')
    .max(5, 'Максимум 5'),
  text: z
    .string()
    .trim()
    .min(1, 'Введите текст отзыва')
    .max(2000, 'Максимум 2000 символов'),
  sourceUrl: z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value
      const trimmed = value.trim()
      return trimmed === '' ? undefined : trimmed
    },
    z.string().url('Неверный URL').optional(),
  ),
  published: z.boolean().default(true),
})

export type ReviewFormData = z.infer<typeof reviewSchema>
```

- [ ] **Step 2: Проверить типы**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/validations/review.ts
git commit -m "feat(reviews): zod-схема валидации отзыва"
```

---

### Task 4: Server actions

**Files:**
- Create: `actions/reviews.ts`

- [ ] **Step 1: Написать actions**

Создать `actions/reviews.ts` (структура полностью повторяет `actions/portfolio.ts`):

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reviewSchema, type ReviewFormData } from '@/lib/validations/review'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized')
  }
}

export async function getPublishedReviews() {
  return prisma.review.findMany({
    where: { published: true },
    orderBy: { reviewDate: 'desc' },
  })
}

export async function getAllReviews() {
  await requireAdmin()
  return prisma.review.findMany({
    orderBy: { reviewDate: 'desc' },
  })
}

export async function createReview(data: ReviewFormData) {
  await requireAdmin()

  const parsed = reviewSchema.safeParse(data)
  if (!parsed.success) return { error: 'Ошибка валидации' }

  const review = await prisma.review.create({ data: parsed.data })
  revalidatePath('/')
  revalidatePath('/admin/reviews')
  return { review }
}

export async function updateReview(id: string, data: ReviewFormData) {
  await requireAdmin()

  const parsed = reviewSchema.safeParse(data)
  if (!parsed.success) return { error: 'Ошибка валидации' }

  const review = await prisma.review.update({
    where: { id },
    data: parsed.data,
  })
  revalidatePath('/')
  revalidatePath('/admin/reviews')
  return { review }
}

export async function deleteReview(id: string) {
  await requireAdmin()

  await prisma.review.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/admin/reviews')
  return { success: true }
}
```

- [ ] **Step 2: Проверить типы**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add actions/reviews.ts
git commit -m "feat(reviews): server actions для CRUD отзывов"
```

---

### Task 5: Админ-страница (server-обёртка) + пункт сайдбара

**Files:**
- Create: `app/admin/(protected)/reviews/page.tsx`
- Modify: `components/admin/AdminSidebar.tsx:12-18`

- [ ] **Step 1: Добавить пункт «Отзывы» в сайдбар**

В файле `components/admin/AdminSidebar.tsx` массив `NAV` (строки 12–18) дополнить, заменив:

```ts
const NAV = [
  { href: '/admin', label: 'Дашборд', icon: '⬡' },
  { href: '/admin/orders', label: 'Заказы', icon: '◫' },
  { href: '/admin/quotes', label: 'Заявки', icon: '✎' },
  { href: '/admin/portfolio', label: 'Портфолио', icon: '◈' },
  { href: '/admin/materials', label: 'Материалы', icon: '◉' },
]
```

на:

```ts
const NAV = [
  { href: '/admin', label: 'Дашборд', icon: '⬡' },
  { href: '/admin/orders', label: 'Заказы', icon: '◫' },
  { href: '/admin/quotes', label: 'Заявки', icon: '✎' },
  { href: '/admin/portfolio', label: 'Портфолио', icon: '◈' },
  { href: '/admin/materials', label: 'Материалы', icon: '◉' },
  { href: '/admin/reviews', label: 'Отзывы', icon: '★' },
]
```

- [ ] **Step 2: Создать server-обёртку страницы**

Создать `app/admin/(protected)/reviews/page.tsx`:

```tsx
import { ReviewsAdminClient } from '@/components/admin/ReviewsAdminClient'
import { getAllReviews } from '@/actions/reviews'

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-foreground font-display">
          Отзывы
        </h1>
      </div>

      <ReviewsAdminClient
        items={reviews.map((r) => ({
          id: r.id,
          authorName: r.authorName,
          reviewDate: r.reviewDate.toISOString(),
          rating: r.rating,
          text: r.text,
          sourceUrl: r.sourceUrl ?? undefined,
          published: r.published,
          updatedAt: r.updatedAt.toISOString(),
        }))}
      />
    </div>
  )
}
```

**Не коммитим и не запускаем typecheck отдельно** — пока нет `ReviewsAdminClient`, страница не компилируется. Коммит делается в Task 6 после создания клиента.

---

### Task 6: `ReviewsAdminClient` — список и форма

**Files:**
- Create: `components/admin/ReviewsAdminClient.tsx`

- [ ] **Step 1: Написать компонент**

Создать `components/admin/ReviewsAdminClient.tsx`:

```tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'

import {
  createReview,
  deleteReview,
  updateReview,
} from '@/actions/reviews'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatReviewDate } from '@/lib/reviews'
import { reviewSchema, type ReviewFormData } from '@/lib/validations/review'

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
  defaultValues?: Partial<ReviewFormData> & { reviewDate?: string }
  onSubmit: (data: ReviewFormData) => void
  onCancel: () => void
  isPending: boolean
}) {
  const initialDate = defaultValues?.reviewDate
    ? new Date(defaultValues.reviewDate as unknown as string)
        .toISOString()
        .slice(0, 10)
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
      reviewDate: initialDate ? (new Date(initialDate) as unknown as Date) : undefined,
    },
  })

  const rating = watch('rating') ?? 5
  const published = watch('published')

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data))}
      className="space-y-4"
    >
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
                onClick={() =>
                  setValue('rating', n, { shouldDirty: true, shouldValidate: true })
                }
                className={`text-2xl leading-none ${
                  active ? 'text-amber-500' : 'text-border'
                }`}
                aria-label={`${n} из 5`}
              >
                ★
              </button>
            )
          })}
        </div>
        {errors.rating && (
          <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs text-muted mb-1">Текст отзыва *</label>
        <Textarea
          {...register('text')}
          rows={5}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
        {errors.text && (
          <p className="text-xs text-red-500 mt-1">{errors.text.message}</p>
        )}
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

      <div className="flex gap-3 pt-2">
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
            : item,
        ),
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
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
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
                        <td className="px-4 py-3 font-medium text-foreground">
                          {item.authorName}
                        </td>
                        <td className="px-4 py-3 text-amber-500 font-mono">
                          {'★'.repeat(item.rating)}
                          <span className="text-border">{'★'.repeat(5 - item.rating)}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap">
                          {formatReviewDate(item.reviewDate)}
                        </td>
                        <td className="px-4 py-3">
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
                        <td className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap">
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
        <div className="rounded-xl border border-border bg-surface p-6">
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
```

- [ ] **Step 2: Проверить типы**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Запустить дев-сервер и вручную проверить**

Run (в отдельном терминале): `pnpm dev`
Открыть `http://localhost:3000/admin/reviews`. Сделать вход под админом. Проверить:
- появилась левая ссылка «Отзывы»
- кнопка «+ Добавить отзыв» открывает форму
- создание отзыва (с именем «Наталья», датой 2026-05-13, оценкой 5, текстом «Тест») — toast «Отзыв добавлен», запись в таблице
- редактирование меняет данные, toast «Отзыв обновлён»
- удаление с confirm убирает запись, toast «Отзыв удалён»
- снятие галки «Опубликовано» → статус в таблице «Скрыто»

Expected: всё работает, никаких ошибок в консоли браузера и в терминале с `pnpm dev`.

- [ ] **Step 4: Commit**

```bash
git add 'app/admin/(protected)/reviews' components/admin/ReviewsAdminClient.tsx components/admin/AdminSidebar.tsx
git commit -m "feat(admin): CRUD-страница отзывов с навигацией и формой"
```

---

### Task 7: `ReviewCard` — презентационная карточка

**Files:**
- Create: `components/landing/ReviewCard.tsx`

- [ ] **Step 1: Написать компонент**

Создать `components/landing/ReviewCard.tsx`:

```tsx
import { ArrowUpRight } from 'lucide-react'

import { avatarColor, formatReviewDate } from '@/lib/reviews'

export interface ReviewCardData {
  id: string
  authorName: string
  reviewDate: Date
  rating: number
  text: string
  sourceUrl: string | null
}

export function ReviewCard({ review }: { review: ReviewCardData }) {
  const initial = review.authorName.charAt(0).toUpperCase() || '?'
  const bg = avatarColor(review.authorName)

  return (
    <article className="h-full rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: bg }}
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{review.authorName}</p>
          <p className="text-xs text-muted font-mono">{formatReviewDate(review.reviewDate)}</p>
        </div>
      </header>

      <div className="flex gap-0.5 text-amber-500" aria-label={`Оценка ${review.rating} из 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < review.rating ? 'text-amber-500' : 'text-border'}>
            ★
          </span>
        ))}
      </div>

      <p className="text-sm text-foreground leading-relaxed flex-1 whitespace-pre-line">
        {review.text}
      </p>

      {review.sourceUrl && (
        <a
          href={review.sourceUrl}
          target="_blank"
          rel="nofollow noopener"
          className="self-end inline-flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors"
        >
          Источник <ArrowUpRight size={12} />
        </a>
      )}
    </article>
  )
}
```

- [ ] **Step 2: Проверить типы**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/landing/ReviewCard.tsx
git commit -m "feat(reviews): карточка отзыва с аватаркой и звёздами"
```

---

### Task 8: `ReviewsCarousel` — клиентский слайдер

**Files:**
- Create: `components/landing/ReviewsCarousel.tsx`

- [ ] **Step 1: Написать компонент**

Создать `components/landing/ReviewsCarousel.tsx`:

```tsx
'use client'

import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { ReviewCard, type ReviewCardData } from './ReviewCard'

export function ReviewsCarousel({ reviews }: { reviews: ReviewCardData[] }) {
  const enableLoop = reviews.length > 3
  const autoplay = useRef(
    Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true }),
  )
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: enableLoop, align: 'start', dragFree: false },
    enableLoop ? [autoplay.current] : [],
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => {
    setSelectedIndex(api.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    onSelect(emblaApi)
    emblaApi.on('select', onSelect).on('reInit', (api) => {
      setScrollSnaps(api.scrollSnapList())
      onSelect(api)
    })
  }, [emblaApi, onSelect])

  const showControls = enableLoop && scrollSnaps.length > 1

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Отзывы клиентов"
    >
      {showControls && (
        <div className="absolute -top-14 right-0 hidden sm:flex gap-2 z-10">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Предыдущий отзыв"
            className="w-9 h-9 rounded-full border border-border bg-surface-raised flex items-center justify-center text-muted hover:text-accent hover:border-(--accent-border) transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Следующий отзыв"
            className="w-9 h-9 rounded-full border border-border bg-surface-raised flex items-center justify-center text-muted hover:text-accent hover:border-(--accent-border) transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div
        className="overflow-hidden -mx-2 select-none cursor-grab active:cursor-grabbing touch-pan-y"
        ref={emblaRef}
      >
        <div className="flex py-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3 min-w-0 px-2"
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <div className="flex justify-center gap-2 mt-6">
          {scrollSnaps.map((_, i) => {
            const active = i === selectedIndex
            return (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Перейти к отзыву ${i + 1}`}
                aria-current={active}
                className={`h-2 rounded-full transition-all ${
                  active ? 'w-6 bg-accent' : 'w-2 bg-border hover:bg-muted'
                }`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Проверить типы**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/landing/ReviewsCarousel.tsx
git commit -m "feat(reviews): слайдер отзывов на embla с автопрокруткой"
```

---

### Task 9: `ReviewsSection` — server-обёртка с JSON-LD

**Files:**
- Create: `components/landing/ReviewsSection.tsx`

- [ ] **Step 1: Написать секцию**

Создать `components/landing/ReviewsSection.tsx`:

```tsx
import { getPublishedReviews } from '@/actions/reviews'
import { buildReviewsJsonLdForLocalBusiness } from '@/lib/reviews'
import { siteUrl } from '@/lib/seo'

import { ReviewsCarousel } from './ReviewsCarousel'

export async function ReviewsSection() {
  const reviews = await getPublishedReviews()

  if (reviews.length === 0) return null

  const jsonLd = buildReviewsJsonLdForLocalBusiness(reviews, siteUrl)

  const carouselReviews = reviews.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    reviewDate: r.reviewDate,
    rating: r.rating,
    text: r.text,
    sourceUrl: r.sourceUrl,
  }))

  return (
    <section className="py-14 sm:py-24 bg-background">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 sm:mb-16">
          <div>
            <span className="label-mono mb-3 text-sm block">Отзывы</span>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-none font-display">
              Что говорят клиенты
            </h2>
            <p className="mt-4 text-sm text-muted max-w-md">
              Реальные оценки наших клиентов с Avito.
            </p>
          </div>
        </div>

        <ReviewsCarousel reviews={carouselReviews} />
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Проверить типы**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add components/landing/ReviewsSection.tsx
git commit -m "feat(reviews): секция отзывов на главной с JSON-LD"
```

---

### Task 10: Вставка секции на главную страницу

**Files:**
- Modify: `app/(main)/page.tsx`

- [ ] **Step 1: Импортировать и вставить компонент**

В файле `app/(main)/page.tsx` заменить:

```tsx
import { FAQSection } from "@/components/landing/FAQSection"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { MaterialsSection } from "@/components/landing/MaterialsSection"
import { PortfolioPreviewSection } from "@/components/landing/PortfolioPreviewSection"
import { ServicesSection } from "@/components/landing/ServicesSection"
```

на:

```tsx
import { FAQSection } from "@/components/landing/FAQSection"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { MaterialsSection } from "@/components/landing/MaterialsSection"
import { PortfolioPreviewSection } from "@/components/landing/PortfolioPreviewSection"
import { ReviewsSection } from "@/components/landing/ReviewsSection"
import { ServicesSection } from "@/components/landing/ServicesSection"
```

И в JSX-части заменить:

```tsx
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <PortfolioPreviewSection />
      <MaterialsSection />
      <FAQSection />
```

на:

```tsx
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <PortfolioPreviewSection />
      <ReviewsSection />
      <MaterialsSection />
      <FAQSection />
```

- [ ] **Step 2: Проверить типы**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add 'app/(main)/page.tsx'
git commit -m "feat(home): подключить секцию отзывов между портфолио и материалами"
```

---

### Task 11: Финальная верификация

**Files:** —

- [ ] **Step 1: Запустить весь тест-сьют**

Run: `pnpm test`
Expected: PASS — `lib/reviews.test.ts` зелёный, существующие `lib/pricing.test.ts` не сломаны.

- [ ] **Step 2: Прогнать typecheck/линт**

Run: `pnpm lint`
Expected: PASS (lint = tsc --noEmit в этом проекте).

- [ ] **Step 3: Прогнать production-сборку**

Run: `pnpm build`
Expected: PASS, в выводе видно успешную статическую генерацию маршрутов `/` и `/admin/reviews`.

- [ ] **Step 4: Ручная проверка в браузере**

Запустить `pnpm dev`. Проверить:
- `http://localhost:3000/admin/reviews` — добавить ≥ 4 отзыва с разными именами/датами/оценками, минимум один с `sourceUrl`, один со снятой галкой «Опубликовано»
- `http://localhost:3000/` — секция «Что говорят клиенты» появилась между «Примеры» (Портфолио) и «Материалы»
- В слайдере видно по 1/2/3 карточки на мобильном/планшете/десктопе (resize окна)
- Автопрокрутка работает, стрелки/точки переключают, hover приостанавливает
- «Скрытый» отзыв в публичной выдаче не появляется
- Открыть DevTools → Elements → найти `<script type="application/ld+json">`, содержащий `aggregateRating` и массив `review` с теми же `@id`, что глобальный LocalBusiness
- Сделать снятие публикации со ВСЕХ отзывов в админке — секция на главной исчезает (после обновления страницы)

Expected: всё работает, в консоли браузера и в `pnpm dev` нет ошибок/предупреждений.

- [ ] **Step 5 (опционально): Проверить JSON-LD валидатором**

Скопировать содержимое обоих `<script type="application/ld+json">` с главной и прогнать через https://validator.schema.org/. Ожидаемо: 0 ошибок, объекты с одинаковым `@id` мержатся в один `ProfessionalService`.

- [ ] **Step 6: Финальный коммит, если что-то поправлено**

Если на верификации потребовались правки — отдельным коммитом. Если правок нет — пропустить шаг.

```bash
git status   # проверить
```
