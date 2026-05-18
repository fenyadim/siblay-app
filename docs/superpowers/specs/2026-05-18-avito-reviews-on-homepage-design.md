# Отзывы Avito на главной странице

**Дата:** 2026-05-18

## Цель

Показать на главной странице сайта 15 отзывов клиентов, скопированных из профиля Avito. Дать возможность администратору добавлять, редактировать, скрывать и удалять отзывы через админ-панель — без перевыпуска сборки.

## Объём работы

- Новая Prisma-модель `Review` + миграция
- Админ-CRUD для отзывов (страницы и API-роуты)
- Публичная секция `ReviewsSection` со слайдером (embla-carousel-react), вставленная между «Наши работы» и «Материалы»
- Расширение JSON-LD `LocalBusiness` полями `aggregateRating` и `review`
- Vitest-тесты для чистых функций (форматер даты, цвет аватарки, среднее, JSON-LD-билдер)

## Вне объёма

- Парсинг/синхронизация с Avito (отзывы вводятся вручную)
- Премодерация, лайки, ответы продавца
- Загрузка фото к отзывам
- Ручная перестановка порядка через drag-and-drop (сортировка по `reviewDate desc`)

## Данные

### Prisma-модель

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

- `rating` хранится как `Int`, допустимые значения 1..5 — валидируются на уровне zod в API-роутах (Postgres `CHECK` не добавляем, чтобы не плодить ручные миграции вне Prisma).
- Длина `text` ограничивается на API (zod: 1..2000), на уровне БД не лимитируется.

### Запрос для главной

```ts
prisma.review.findMany({
  where: { published: true },
  orderBy: { reviewDate: "desc" },
})
```

## Архитектура файлов

| Файл | Назначение |
|------|------------|
| `prisma/schema.prisma` | + модель `Review` |
| `prisma/migrations/<ts>_add_reviews/migration.sql` | Миграция |
| `lib/reviews.ts` | Чистые утилиты: `formatReviewDate`, `avatarColor`, `averageRating`, `buildLocalBusinessJsonLd` |
| `lib/reviews.test.ts` | Vitest на эти утилиты |
| `lib/validation/review.ts` | zod-схема `reviewInputSchema` (используется в API и формах админки) |
| `app/api/admin/reviews/route.ts` | GET (list), POST (create) |
| `app/api/admin/reviews/[id]/route.ts` | GET, PATCH, DELETE |
| `app/admin/reviews/page.tsx` | Список отзывов |
| `app/admin/reviews/new/page.tsx` | Форма создания |
| `app/admin/reviews/[id]/page.tsx` | Форма редактирования |
| `components/admin/ReviewForm.tsx` | Общая RHF-форма для create/edit |
| `components/landing/ReviewsSection.tsx` | Server-component: фетч отзывов + JSON-LD + врапер |
| `components/landing/ReviewsCarousel.tsx` | Client-component: embla-слайдер |
| `components/landing/ReviewCard.tsx` | Презентационный компонент карточки |
| `app/(main)/page.tsx` | Вставка `<ReviewsSection />` между `PortfolioPreviewSection` и `MaterialsSection` |
| `components/admin/Sidebar` (фактический путь определить при реализации) | + пункт «Отзывы» |
| `lib/seo.ts` | + функция `buildLocalBusinessJsonLd(reviews)`; рефактор существующего JSON-LD-вывода, если он сейчас в `layout.tsx` без отзывов |

## Публичный UI

### `ReviewsSection` (server)

- Между «Наши работы» (`PortfolioPreviewSection`) и «Материалы» (`MaterialsSection`).
- Если опубликованных отзывов 0 — секция не рендерится (возвращает `null`).
- Заголовок «Отзывы клиентов».
- Подзаголовок: «Реальные оценки наших клиентов с Avito» (фиксированный текст, без числа — чтобы не возиться с русским склонением 1/2-4/5+; число при желании можно добавить в follow-up через утилиту склонения).
- Вставляет `<script type="application/ld+json">` с `buildLocalBusinessJsonLd(reviews)` (если общий `LocalBusiness` уже выводится глобально — расширяем тот объект; решение принимается при чтении `lib/seo.ts` на стадии реализации, но в обоих случаях итоговый JSON-LD на главной содержит `aggregateRating` и массив `review`).

### `ReviewsCarousel` (client)

- `embla-carousel-react` + `embla-carousel-autoplay`.
- `slidesToScroll: 1`, `loop: true`.
- Видимые слайды через CSS: `flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.3333%]`.
- Autoplay 6000 мс, `stopOnInteraction: true`. Пауза на hover/focus реализуется через `embla.plugins().autoplay.stop()` / `.play()` в обработчиках.
- Стрелки `‹ ›` в правом верхнем углу секции (над слайдером), точки-индикаторы — под слайдером по центру.
- Доступность: контейнер `role="region" aria-roledescription="carousel" aria-label="Отзывы клиентов"`; стрелки и точки — кнопки с `aria-label`.
- При `reviews.length <= 3`: автопрокрутка и стрелки скрыты, точки тоже; карточки выводятся flex-рядом.

### `ReviewCard`

Структура:
- Слева сверху — кружок-аватарка 40×40 с первой буквой имени, цвет фона = `avatarColor(authorName)`, текст белый.
- Справа от аватарки: имя автора, под ним — дата отформатирована `Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" })`.
- Ниже — строка из 5 звёзд (`★` заполненные = `rating`, `☆` пустые до пяти). Использовать SVG-иконку из существующего набора (`lucide-react`, если используется в проекте), цвет — акцентный.
- Текст отзыва — целиком, без обрезки.
- Если `sourceUrl` задан — внизу справа малозаметная ссылка «Источник →» с `rel="nofollow noopener"` и `target="_blank"`.

`avatarColor(name)` — детерминированный выбор из палитры 6 пастельных оттенков (HSL). Алгоритм: сумма char-кодов `name` modulo 6.

## Админ-UI

### Список — `app/admin/reviews/page.tsx`

Таблица:

| Автор | Оценка | Дата отзыва | Опубликован | Обновлён | Действия |
|-------|--------|-------------|-------------|----------|----------|
| Наталья | ★★★★★ | 13.05.2026 | ✓ | 18.05 21:50 | [Изменить] [Удалить] |

- Сверху кнопка «Добавить отзыв» → `/admin/reviews/new`.
- Чекбокс `published` переключается inline (PATCH `/api/admin/reviews/:id` { published }).
- Удаление с `window.confirm` (согласно существующему стилю проекта).
- Сортировка списка — `reviewDate desc` (как и на публичной выдаче).

### Форма — `components/admin/ReviewForm.tsx`

React Hook Form + zod (`reviewInputSchema`). Поля:

| Поле | Контрол | Валидация |
|------|---------|-----------|
| `authorName` | text | required, 1..100 |
| `reviewDate` | date | required, не будущее |
| `rating` | radio-group из 5 кнопок-звёзд | required, 1..5 |
| `text` | textarea (5 строк) | required, 1..2000 |
| `sourceUrl` | text | optional, валидный URL (zod `.url()`) |
| `published` | checkbox | default `true` |

Кнопки «Сохранить» / «Отмена». Toast-уведомления (sonner — уже стоит).

### API

- `POST /api/admin/reviews` — `reviewInputSchema.parse(body)`, `prisma.review.create`, `revalidatePath("/")` + `revalidatePath("/admin/reviews")`, ответ 201 + объект.
- `GET /api/admin/reviews` — список всех (включая `published=false`), сортировка `reviewDate desc`.
- `GET /api/admin/reviews/[id]` — один отзыв, 404 если не найден.
- `PATCH /api/admin/reviews/[id]` — частичное обновление через `reviewInputSchema.partial()`, `revalidatePath("/")` + `revalidatePath("/admin/reviews")`.
- `DELETE /api/admin/reviews/[id]` — удаление, `revalidatePath("/")` + `revalidatePath("/admin/reviews")`, 204.
- Авторизация — тем же механизмом, что и у `/api/admin/quotes` (повторно использовать существующую middleware/guard-функцию; конкретный механизм уточнить при чтении кода).

### Сайдбар

В админ-сайдбаре (где сейчас «Заказы», «Заявки») — добавить «Отзывы» со ссылкой на `/admin/reviews`. Иконка — `MessageSquareQuote` из `lucide-react` (или ближайшая по смыслу из уже импортированных).

## SEO / JSON-LD

В `lib/seo.ts` добавить:

```ts
export function buildLocalBusinessJsonLd(reviews: Review[]) {
  const base = { /* существующий LocalBusiness */ }
  if (reviews.length === 0) return base
  return {
    ...base,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: averageRating(reviews.map(r => r.rating))!.toFixed(1),
      reviewCount: reviews.length,
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.map(r => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.authorName },
      datePublished: r.reviewDate.toISOString().slice(0, 10),
      reviewRating: {
        "@type": "Rating",
        ratingValue: String(r.rating),
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: r.text,
    })),
  }
}
```

- Если 0 опубликованных отзывов — JSON-LD на главной выводится без `aggregateRating`/`review` (Google требует минимум один отзыв для `aggregateRating`).
- На странице реализации: если сейчас `LocalBusiness` рендерится глобально в `layout.tsx`, переносим (или дублируем) только на главной — серверный фетч отзывов всё равно нужен, нет смысла гонять его на всех страницах.

## Кэширование

- `app/(main)/page.tsx` уже имеет `export const revalidate = 300`. Этого достаточно для базового сценария.
- После любой мутации в admin API — `revalidatePath("/")` + `revalidatePath("/admin/reviews")` для немедленного обновления.

## Валидация (`lib/validation/review.ts`)

```ts
export const reviewInputSchema = z.object({
  authorName: z.string().trim().min(1).max(100),
  reviewDate: z.coerce.date().refine(d => d <= new Date(), "Дата не может быть в будущем"),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(1).max(2000),
  sourceUrl: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  published: z.boolean().default(true),
})
```

## Тесты (Vitest)

**`lib/reviews.test.ts`:**
- `formatReviewDate(new Date("2026-05-13"))` → `"13 мая 2026"`
- `avatarColor("Наталья")` детерминирован; разные имена попадают в разные индексы палитры (smoke на 4–5 имён)
- `averageRating([5,5,4,5,3])` → `4.4`; `averageRating([])` → `null`
- `buildLocalBusinessJsonLd([])` → не содержит `aggregateRating` и `review`
- `buildLocalBusinessJsonLd([review])` → `aggregateRating.reviewCount === 1`, `review.length === 1`, `datePublished` в формате `YYYY-MM-DD`

**`components/landing/ReviewCard.test.tsx`** *(только если в проекте уже настроен `@testing-library/react`; иначе пропустить и зафиксировать в плане как «вне объёма»):*
- Рендерит ровно `rating` заполненных звёзд
- Не рендерит ссылку «Источник», если `sourceUrl` отсутствует
- Рендерит ссылку с `rel="nofollow noopener"` и `target="_blank"`, если `sourceUrl` есть

## Риски и решения

| Риск | Решение |
|------|---------|
| Тяжёлая первичная гидратация слайдера на главной | `ReviewsCarousel` — отдельный client-компонент с `"use client"`, всё остальное в секции — server |
| Google не принимает `aggregateRating` без `review` | Гарантированно отдаём оба поля только при `reviews.length > 0` |
| Конфликт глобального и секционного JSON-LD | На стадии реализации читаем `lib/seo.ts`/`layout.tsx`; либо расширяем существующий объект, либо рендерим только на главной |
| Длинный отзыв ломает карточку | Текст переносится естественно; высота карточки на главной зафиксирована минимальной шириной столбца. Если в реальных данных найдутся отзывы >800 символов — добавим `line-clamp` в follow-up |

## Открытые вопросы для стадии плана

- Конкретный механизм авторизации админ-роутов (читается в `app/api/admin/quotes/...` при составлении плана).
- Точное место рендера `LocalBusiness` JSON-LD сейчас (читается в `lib/seo.ts`/`app/layout.tsx`).
- Имя файла сайдбара админки.

Эти пункты — для уточнения при реализации, на дизайн не влияют.
