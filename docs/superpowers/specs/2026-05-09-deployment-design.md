# Деплой через Docker и Coolify

**Дата:** 2026-05-09
**Статус:** Утверждён, готов к плану реализации

## Цель

Подготовить проект к продакшен-деплою на самостоятельный VPS через Coolify. Получить:

- Маленький Docker-образ (~150–200 МБ) с production-сборкой Next.js
- Автоматическое применение миграций Prisma при старте контейнера
- Настройку через Coolify UI (без `docker-compose` в репо)
- HTTPS, проксирование, health-check — всё через Coolify
- Воспроизводимый локальный build через `docker build`

## Стек деплоя

- **VPS** (свой сервер пользователя)
- **Coolify** — self-hosted PaaS на этом VPS, управляет контейнерами через свой Docker
- **Postgres** — отдельный managed-сервис в Coolify (один клик), внутренняя сеть Docker
- **Node 22 LTS** в Alpine-контейнере
- **Next.js 16.2.2** в режиме `output: 'standalone'`
- **Prisma 7.6** с миграциями (`prisma/migrations/`), применяются через `prisma migrate deploy` в entrypoint
- **HTTPS / reverse-proxy** — встроенный Caddy/Traefik в Coolify, Let's Encrypt автоматически

## Объём работы

**Включено:**

- `Dockerfile` (multi-stage: deps → builder → runner)
- `docker/entrypoint.sh` (миграции + старт)
- `.dockerignore`
- Правка `next.config.ts`: добавить `output: 'standalone'` и `outputFileTracingRoot`
- Локальная инициализация миграций: `pnpm prisma migrate dev --name init` + коммит папки `prisma/migrations`
- Документация по настройке Coolify (что куда вносить в UI)

**Явно вне scope:**

- `docker-compose.yml` — Coolify оркеструет контейнеры сам
- nginx внутри образа — Coolify проксирует на свой Caddy/Traefik
- CI/CD пайплайн (GitHub Actions и т.п.) — Coolify сам слушает git push (или деплоит по кнопке)
- Health-check эндпоинт `/api/health` — отдельная задача, для MVP проверяем главную страницу
- Multi-arch build (arm64 + amd64) — собираем под архитектуру VPS
- Seed скрипт (`db:seed`) в production — выполняется руками через `coolify execute` если потребуется

## Файловая структура изменений

**Создать:**
- `Dockerfile` (в корне репозитория)
- `.dockerignore` (в корне)
- `docker/entrypoint.sh` (в новой папке `docker/`)

**Модифицировать:**
- `next.config.ts` — добавить `output: 'standalone'` и `outputFileTracingRoot`
- (Опционально) `package.json` — пометить `packageManager` для воспроизводимой версии pnpm

**Создать локально один раз:**
- `prisma/migrations/<timestamp>_init/migration.sql` — первая миграция через `prisma migrate dev --name init`. Папка коммитится в репо.

## Архитектура контейнера

### Stage 1 — `deps`

Кэшируется по `pnpm-lock.yaml`. Пересобирается только при изменении зависимостей.

```dockerfile
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile
```

`prisma/` копируется на этом шаге, потому что `postinstall` запускает `prisma generate`, которому нужна `schema.prisma`.

### Stage 2 — `builder`

Собирает приложение, запекает `NEXT_PUBLIC_*` в клиентский бандл.

```dockerfile
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build
```

### Stage 3 — `runner`

Финальный production-образ. Только то, что нужно для запуска.

```dockerfile
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Prisma CLI глобально — для migrate deploy
RUN npm install -g prisma@7.6.0 && npm cache clean --force

# Непривилегированный пользователь
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

# Standalone бандл Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma: схема + миграции для migrate deploy
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Prisma client + engine
COPY --from=builder --chown=nextjs:nodejs /app/app/generated/prisma ./app/generated/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Entrypoint
COPY --chown=nextjs:nodejs docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod +x ./docker/entrypoint.sh

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

ENTRYPOINT ["./docker/entrypoint.sh"]
```

**Почему именно так:**

- `node:22-alpine` — LTS, маленькая база. `libc6-compat` и `openssl` нужны Prisma engine
- `corepack` — нативный путь Node 22 для запуска pnpm без отдельной установки
- Глобальный `prisma@7.6.0` в runner — нужен для `migrate deploy` в entrypoint, надёжно работает с любым layout `node_modules` (pnpm hoisting не имеет значения)
- `PORT=3000` и `HOSTNAME=0.0.0.0` — обязательны для standalone-сервера, иначе он биндится на localhost и Coolify не проксирует
- `ENTRYPOINT` (не `CMD`) — entrypoint сначала прогоняет миграции, потом стартует Next; параметры контейнеру передавать не нужно

## `docker/entrypoint.sh`

```sh
#!/bin/sh
set -e

echo "[entrypoint] Applying database migrations..."
prisma migrate deploy

echo "[entrypoint] Starting Next.js server..."
exec node server.js
```

**Почему так:**

- `set -e` — миграция упала → контейнер не стартует, Coolify видит ошибку
- `migrate deploy` — production-команда, идемпотентна, никогда не пытается генерировать или сбрасывать БД
- `exec node server.js` — заменяет shell-процесс на Node, чтобы `SIGTERM` от Coolify дошёл до приложения и тот корректно завершился

## `next.config.ts`

```ts
import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.resolve(__dirname),
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.storage.beget.cloud' },
    ],
  },
}

export default nextConfig
```

**Что меняется:**

- `output: 'standalone'` — Next трассирует импорты и собирает self-contained бандл в `.next/standalone`
- `outputFileTracingRoot` — явно задаём корень для трассировки. У нас Prisma client в нестандартном `app/generated/prisma`, плюс pnpm с symlinks — без этой опции Next может пропустить файлы

**Возможный риск:** если на сборке Next.js будет ругаться, что не нашёл Prisma engine binary, добавляем:

```ts
outputFileTracingIncludes: {
  '/**/*': ['./node_modules/.prisma/**'],
},
```

Но сначала пробуем без этого — обычно `COPY` явных путей в runner-стадии решает проблему.

## `.dockerignore`

```
.git
.gitignore
.gitattributes

node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.pnpm-store

.next
out
next-env.d.ts

.env
.env.local
.env.*.local
.env.development
.env.production

.vscode
.idea
*.swp
*.swo

.DS_Store
Thumbs.db

dist
build
coverage
*.tsbuildinfo

.turbo
.cache

docs
README.md
LICENSE
AGENTS.md
CLAUDE.md

Dockerfile
.dockerignore
docker-compose*.yml
.github
.gitlab-ci.yml

.claude

*.log
.husky
```

**Что критично исключить:**

- `node_modules` — всегда. Иначе build context раздувается на сотни МБ
- `.env*` (кроме `.env.example`) — секреты не должны попасть в build context
- `.next/` — старый локальный билд может конфликтовать
- `docs/`, `.claude/` — рабочие артефакты разработки, в проде не нужны

## Миграции Prisma — bootstrap

Локально, до первого деплоя:

```bash
# Генерим первую миграцию из текущей схемы
pnpm prisma migrate dev --name init

# Коммитим папку миграций
git add prisma/migrations
git commit -m "feat(prisma): initialize migration history"
```

После этого папка `prisma/migrations/` живёт в репо. На всех будущих сборках в Docker entrypoint выполнит `prisma migrate deploy` и применит к Coolify-Postgres.

При будущих изменениях схемы:
- Локально: `pnpm prisma migrate dev --name <change_name>` — создаёт новый файл миграции
- Коммитим миграцию
- Деплой в Coolify — entrypoint применит автоматически

## Coolify — настройка в UI

**1. Postgres:**
- New Resource → Database → PostgreSQL 16
- Запоминаем internal URL: `postgresql://postgres:<password>@<service-name>:5432/postgres`

**2. Приложение:**
- New Resource → Public/Private Repository → siblay-app
- Build Pack: **Dockerfile**
- Port: `3000`

**3. Build Variables (отдельная вкладка от Runtime!):**
```
NEXT_PUBLIC_SITE_URL=https://siblay.ru
NEXT_PUBLIC_YANDEX_METRIKA_ID=109131648
```

**4. Runtime Environment Variables:**
```
DATABASE_URL=<internal URL Postgres из шага 1>
AWS_REGION=<...>
AWS_ACCESS_KEY_ID=<...>
AWS_SECRET_ACCESS_KEY=<...>
AWS_S3_BUCKET=<...>
BETTER_AUTH_SECRET=<...>
BETTER_AUTH_URL=https://siblay.ru
ADMIN_EMAIL=<...>
ADMIN_PASSWORD=<...>
TELEGRAM_BOT_TOKEN=<...>
TELEGRAM_CHAT_ID=<...>
NODE_ENV=production
```

**5. Healthcheck:**
- Path: `/`, Method: GET
- Interval: 30s, Timeout: 10s, Retries: 3

**6. Домен:**
- Domains: `siblay.ru` (+ `www.siblay.ru`)
- Force HTTPS: on
- Coolify автоматически выпустит Let's Encrypt сертификат

**Критически важно:**

- **Build vs Runtime разделение** — `NEXT_PUBLIC_*` запекаются на build, остальные читаются на старте. Если положить `NEXT_PUBLIC_YANDEX_METRIKA_ID` только в Runtime — счётчик не подключится. Это самая частая ошибка
- **Internal URL Postgres** — у Coolify виртуальная сеть, контейнеры видят друг друга по service-name. Не нужно открывать порт Postgres наружу

## Приёмочное тестирование

1. **Локальный build:** `docker build --build-arg NEXT_PUBLIC_SITE_URL=https://siblay.ru --build-arg NEXT_PUBLIC_YANDEX_METRIKA_ID=109131648 -t siblay:test .` проходит без ошибок
2. **Размер образа:** `docker images siblay:test` — ожидаем 150–250 МБ
3. **Локальный запуск (smoke):** `docker run --rm -p 3000:3000 -e DATABASE_URL=<test_db> ... siblay:test` — приложение стартует, главная отвечает 200
4. **Coolify deploy:** деплой проходит, в логах видно `[entrypoint] Applying database migrations...` и `[entrypoint] Starting Next.js server...`
5. **HTTPS:** `https://siblay.ru` отдаёт 200 с валидным сертификатом
6. **Метрика:** в инкогнито → принять баннер → Network запрос к `mc.yandex.ru/metrika/tag.js?id=109131648`
7. **DB:** загрузка тестового заказа (без файлов) сохраняется в Postgres, видна в `coolify execute psql ...`

## Open issues / future iterations

- Добавить эндпоинт `/api/health` который дёргает `prisma.$queryRaw\`SELECT 1\`` — точнее проверяет работоспособность чем GET `/`
- Multi-arch build для arm64 — если перейдём на ARM-сервер
- GitHub Actions для автоматического push образа в registry — Coolify умеет деплоить из registry, не только из git
- Worker-контейнер для очередей (если потребуется фоновая обработка заказов)
- Sentry или альтернатива для отслеживания ошибок в проде
