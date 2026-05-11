# Siblay

Сайт мастерской 3D-печати и моделирования: [siblay.ru](https://siblay.ru). Лендинг, портфолио и форма заказа с приёмом 3D-моделей; админка для управления материалами, портфолио и заявками.

## Стек

- **Next.js 16** (App Router, Turbopack, `output: 'standalone'`)
- **React 19** + TypeScript
- **Tailwind v4** + shadcn/ui + Radix
- **Prisma 7** + PostgreSQL
- **Better Auth** — почта/пароль, один админ
- **S3** (Beget Cloud) для пользовательских файлов
- **Nodemailer + Telegram bot** — уведомления о заказах
- **Yandex Metrika** + Webvisor 2.0

## Локальный запуск

Нужны: Node 20+, pnpm 10+, PostgreSQL, S3-совместимое хранилище.

```bash
pnpm install
cp .env.example .env   # заполнить значения
pnpm db:push           # накатить схему в БД
pnpm db:seed           # создать админа + сидовое портфолио и материалы
pnpm dev               # http://localhost:3000
```

Все необходимые переменные окружения и комментарии к ним — в [.env.example](.env.example).

## Скрипты

| Команда | Что делает |
|---------|-----------|
| `pnpm dev` | dev-сервер с Turbopack |
| `pnpm build` | production-сборка |
| `pnpm start` | запустить собранный сервер |
| `pnpm typecheck` | `tsc --noEmit` (используется и как `lint`, и как `test`) |
| `pnpm db:push` | синхронизировать схему Prisma с БД |
| `pnpm db:seed` | посеять админа, материалы, портфолио |
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:generate` | перегенерировать клиент Prisma |

## Структура

```
app/
  (main)/          публичные страницы: /, /order, /portfolio, /privacy, /consent
  admin/           админка: /admin/login + защищённые /admin/(protected)/*
  api/
    auth/          Better Auth handler
    upload/        загрузка файлов в S3 (с rate-limit)
  layout.tsx       глобальный layout + SEO-метаданные
  sitemap.ts       /sitemap.xml
  opengraph-image.tsx, manifest.ts, robots.txt
actions/           server actions: orders, portfolio, materials
components/        admin, landing, layout, order, portfolio, ui (shadcn)
lib/
  auth.ts          Better Auth + встроенный rate-limit
  prisma.ts        Prisma client с PgAdapter
  s3.ts            S3 клиент + signed URLs
  notifications.ts SMTP + Telegram + email-шаблон заказа
  rate-limit.ts    in-memory rate-limit (см. ниже)
  validations/     Zod-схемы
prisma/
  schema.prisma    User, Session, Order, OrderFile, PortfolioItem, Material, MaterialColor
  migrations/      миграции
  seed.ts          сидинг
proxy.ts           Next 16 proxy: cookie-проверка /admin/* + глобальный soft rate-limit
docker/            entrypoint.sh (миграции + старт)
Dockerfile         3-stage production-образ
```

## Аутентификация

Single-tenant админка. Регистрация отключена (`disableSignUp: true`); единственный аккаунт создаётся командой `pnpm db:seed` из `ADMIN_EMAIL` + `ADMIN_PASSWORD`. После сида `ADMIN_PASSWORD` можно убрать из окружения.

Защита `/admin/*`:
1. [proxy.ts](proxy.ts) — Edge-проверка наличия session-куки, редирект на `/admin/login`.
2. [app/admin/(protected)/layout.tsx](app/admin/(protected)/layout.tsx) — полная валидация сессии и сверка email с `ADMIN_EMAIL`.

## Rate limiting

In-memory лимитер ([lib/rate-limit.ts](lib/rate-limit.ts)), действует только для **одного процесса** — нашего Docker-контейнера. При горизонтальном масштабировании заменить на Redis/Upstash.

| Контур | Лимит | Где |
|--------|-------|-----|
| Глобально на публичных роутах | 120 req/мин на IP | [proxy.ts](proxy.ts) |
| Брутфорс логина (`/api/auth/sign-in/email`) | 5 / 5 мин | [lib/auth.ts](lib/auth.ts) (встроенный Better Auth) |
| Прочие `/api/auth/*` | 60 / мин | там же |
| Создание заказа (`createOrder`) | 5 / час | [actions/orders.ts](actions/orders.ts) |
| Загрузка файлов (`/api/upload`) | 20 / час | [app/api/upload/route.ts](app/api/upload/route.ts) |

## Деплой

Прод собирается через многоступенчатый [Dockerfile](Dockerfile) с `output: 'standalone'` и non-root пользователем. На старте контейнер сам прогоняет `prisma migrate deploy` через [docker/entrypoint.sh](docker/entrypoint.sh), затем запускает сервер.

```bash
docker build -t siblay .
docker run --env-file .env -p 3000:3000 siblay
```

Sitemap и robots — динамические (см. `app/sitemap.ts`, `public/robots.txt`).

## Известные ограничения

- **Yandex Веб-визор** показывает голый HTML на записях старше последнего деплоя — CSS-файлы с content-hash удаляются при пересборке. Принято как осознанное ограничение.
- **Тестов нет** — `pnpm test` это `tsc --noEmit`.
- **CI/CD отсутствует** — деплой ручной.
