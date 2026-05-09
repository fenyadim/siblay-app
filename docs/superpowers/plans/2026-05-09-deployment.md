# Деплой через Docker и Coolify — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Подготовить production-ready Docker-сборку Next.js приложения с миграциями Prisma в entrypoint, протестировать локально, затем настроить деплой в Coolify.

**Architecture:** Multi-stage Dockerfile (deps → builder → runner) с Next.js `output: 'standalone'`. Prisma миграции применяются автоматически в entrypoint через `prisma migrate deploy`. Coolify оркеструет контейнер, прокси, HTTPS.

**Tech Stack:** Docker · Node 22 Alpine · pnpm · Next.js 16.2.2 standalone · Prisma 7.6 · Coolify · PostgreSQL 16

**Тестовая дисциплина:** Проект не использует unit-тесты — это деплой-инфраструктура. Дисциплина:
1. После каждой правки кода — `pnpm run typecheck` если правится TS
2. После Dockerfile — локальный `docker build` (контракт: образ собирается)
3. После сборки — локальный smoke-test через `docker run` (контракт: главная отвечает 200)
4. На Coolify — финальный приёмочный тест

**Reference:** `docs/superpowers/specs/2026-05-09-deployment-design.md`

**Предусловия:**
- Локальный PostgreSQL запущен и доступен по `DATABASE_URL` из `.env` (нужно для Task 2)
- Docker Desktop / Docker Engine установлен и работает (нужно для Task 7)

---

## Файловая структура

**Создать:**
- `Dockerfile` (в корне)
- `.dockerignore` (в корне)
- `docker/entrypoint.sh`
- `prisma/migrations/<timestamp>_init/migration.sql` (создаётся через `prisma migrate dev`)
- `prisma/migrations/migration_lock.toml` (создаётся автоматически)

**Модифицировать:**
- `next.config.ts` (добавить `output: 'standalone'` + `outputFileTracingRoot`)

---

## Task 1: Включить standalone output в Next.js

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Обновить next.config.ts**

Заменить содержимое файла `next.config.ts` на:

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

Изменения относительно текущего файла:
- Добавлены строки `output: 'standalone'` и `outputFileTracingRoot: path.resolve(__dirname)` сразу после открывающего `{`

- [ ] **Step 2: Проверить компиляцию**

Run: `pnpm run typecheck`
Expected: PASS, без ошибок.

- [ ] **Step 3: Проверить production build**

Run: `pnpm run build`
Expected:
- Build проходит без ошибок
- Создана папка `.next/standalone/` с файлом `server.js` внутри
- Создана папка `.next/static/`

Verify: `ls .next/standalone/server.js` — файл существует.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat(deploy): enable standalone output for Docker builds"
```

---

## Task 2: Инициализировать Prisma миграции

**Files:**
- Create: `prisma/migrations/<timestamp>_init/migration.sql` (создаётся автоматически)
- Create: `prisma/migrations/migration_lock.toml` (создаётся автоматически)

**Пререк:** локальный Postgres должен быть запущен и доступен по `DATABASE_URL` из `.env`. Проверить: `pnpm prisma db pull` — если работает, БД доступна. Если нет — поднять Postgres локально или через Docker (`docker run --rm -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`).

- [ ] **Step 1: Создать первую миграцию из текущей схемы**

Run: `pnpm prisma migrate dev --name init`

Что произойдёт:
- Prisma посмотрит текущее состояние локальной БД
- Сгенерирует SQL для приведения БД к схеме `prisma/schema.prisma`
- Создаст файл `prisma/migrations/<timestamp>_init/migration.sql`
- Применит миграцию к локальной БД
- Создаст `prisma/migrations/migration_lock.toml` с провайдером `postgresql`
- Регенерирует Prisma client

**Если БД уже содержит данные/таблицы**, которые соответствуют схеме (т.е. вы раньше делали `db push`), Prisma может пожаловаться на drift. В этом случае:

```bash
# Сбросить локальную БД (БД для разработки, данные не критичны)
pnpm prisma migrate reset --force
# Повторить
pnpm prisma migrate dev --name init
```

Если данные локальной БД важны — сделайте дамп перед reset (`pg_dump`) и восстановите после.

Expected:
- Папка `prisma/migrations/` создана и не пуста
- В ней есть `<timestamp>_init/migration.sql` с CREATE TABLE для всех моделей
- Есть `migration_lock.toml`

- [ ] **Step 2: Проверить структуру**

Run: `ls prisma/migrations/`
Expected: видны папка с timestamped именем (например `20260509220000_init`) и файл `migration_lock.toml`.

Verify content: `cat prisma/migrations/migration_lock.toml`
Expected:
```
provider = "postgresql"
```

- [ ] **Step 3: Commit**

```bash
git add prisma/migrations
git commit -m "feat(prisma): initialize migration history with init migration"
```

---

## Task 3: Создать `.dockerignore`

**Files:**
- Create: `.dockerignore` (в корне)

- [ ] **Step 1: Создать файл**

Создать файл `.dockerignore` в корне проекта со следующим содержимым:

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

- [ ] **Step 2: Проверить, что файл создан**

Run: `cat .dockerignore | head -5`
Expected: видим первые строки файла (`.git`, `.gitignore`, ...).

- [ ] **Step 3: Commit**

```bash
git add .dockerignore
git commit -m "chore(deploy): add .dockerignore to keep build context lean"
```

---

## Task 4: Создать `docker/entrypoint.sh`

**Files:**
- Create: `docker/entrypoint.sh`

- [ ] **Step 1: Создать папку и файл**

Создать файл `docker/entrypoint.sh` со следующим содержимым:

```sh
#!/bin/sh
set -e

echo "[entrypoint] Applying database migrations..."
prisma migrate deploy

echo "[entrypoint] Starting Next.js server..."
exec node server.js
```

Папка `docker/` должна быть создана при создании файла.

- [ ] **Step 2: Сделать скрипт исполняемым**

На Linux/macOS:
```bash
chmod +x docker/entrypoint.sh
```

На Windows (PowerShell): `chmod` нет, но при `git add` нужно установить executable bit:
```powershell
git update-index --chmod=+x docker/entrypoint.sh
```

(На Windows файл всё равно копируется в Docker как обычный файл; executable bit важен после COPY в Docker — но мы его явно ставим в Dockerfile через `RUN chmod +x`. Тем не менее, метаданные git-файла лучше иметь правильные.)

- [ ] **Step 3: Проверить содержимое**

Run: `cat docker/entrypoint.sh`
Expected: точно совпадает со Step 1.

- [ ] **Step 4: Commit**

```bash
git add docker/entrypoint.sh
git commit -m "feat(deploy): add Docker entrypoint with prisma migrate deploy"
```

---

## Task 5: Создать `Dockerfile`

**Files:**
- Create: `Dockerfile` (в корне)

- [ ] **Step 1: Создать Dockerfile**

Создать файл `Dockerfile` в корне проекта со следующим содержимым:

```dockerfile
# syntax=docker/dockerfile:1.7

# ─── Stage 1: deps ────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile

# ─── Stage 2: builder ─────────────────────────────────────────────────────
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

# ─── Stage 3: runner ──────────────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Prisma CLI глобально — для migrate deploy в entrypoint
RUN npm install -g prisma@7.6.0 && npm cache clean --force

# Непривилегированный пользователь
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

# Standalone бандл Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma: схема + миграции для migrate deploy
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Prisma client (custom output) + engine binary
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

- [ ] **Step 2: Проверить syntax**

Run: `docker buildx build --check .`
Expected: либо PASS, либо предупреждения (warnings) — но не ошибки. Если возникнут ошибки парсинга — поправить.

(Если у вас не установлен `buildx` — можно пропустить этот шаг и сразу делать `docker build` в Task 6.)

- [ ] **Step 3: Commit**

```bash
git add Dockerfile
git commit -m "feat(deploy): add multi-stage Dockerfile with standalone Next.js"
```

---

## Task 6: Локальный Docker build

**Files:** нет правок, только проверка.

- [ ] **Step 1: Запустить docker build**

Run:
```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://siblay.ru \
  --build-arg NEXT_PUBLIC_YANDEX_METRIKA_ID=109131648 \
  -t siblay:test \
  .
```

Expected:
- Все три stage'a (deps, builder, runner) собираются успешно
- Команда завершается с кодом 0
- В выводе видим `=> => naming to docker.io/library/siblay:test`

Если упадёт на каком-то шаге — посмотреть ошибку, исправить (типичные проблемы: отсутствует Prisma engine, неправильные пути copy). Если ошибка про Prisma engine binary — добавить в `next.config.ts`:

```ts
outputFileTracingIncludes: {
  '/**/*': ['./node_modules/.prisma/**'],
},
```

И повторить build.

- [ ] **Step 2: Проверить размер образа**

Run: `docker images siblay:test`
Expected: SIZE в пределах 150–300 МБ. Если значительно больше (например, 800 МБ+) — что-то пошло не так со standalone, возможно Prisma тащит много лишнего. Посмотреть слои: `docker history siblay:test` — самый большой слой подскажет источник.

- [ ] **Step 3: Commit (если меняли next.config.ts)**

Если для прохождения build пришлось добавить `outputFileTracingIncludes`:

```bash
git add next.config.ts
git commit -m "fix(deploy): include Prisma engine in standalone trace"
```

Если Task 6 прошёл без правок — пропустить commit.

---

## Task 7: Локальный smoke-test через docker run

**Files:** нет правок, только проверка.

- [ ] **Step 1: Запустить контейнер**

Здесь нужны рабочие credentials к локальному Postgres (тому же, что использовался в Task 2). Замените `<DATABASE_URL>` на актуальное значение из вашего `.env`. Остальные env-переменные ставим в фейковые значения — для smoke-теста они не нужны (S3 не используется на главной странице, Telegram бот не вызывается до отправки заказа).

```bash
docker run --rm -d \
  --name siblay-test \
  -p 3001:3000 \
  -e DATABASE_URL="<DATABASE_URL из вашего .env>" \
  -e BETTER_AUTH_SECRET="test-secret-not-for-prod" \
  -e BETTER_AUTH_URL="http://localhost:3001" \
  -e ADMIN_EMAIL="admin@test.local" \
  -e ADMIN_PASSWORD="testpass" \
  -e AWS_REGION="ru-central-1" \
  -e AWS_ACCESS_KEY_ID="dummy" \
  -e AWS_SECRET_ACCESS_KEY="dummy" \
  -e AWS_S3_BUCKET="dummy" \
  -e TELEGRAM_BOT_TOKEN="dummy" \
  -e TELEGRAM_CHAT_ID="dummy" \
  siblay:test
```

На Windows (PowerShell) — backslashes заменить на backticks `` ` `` для переноса строк, либо вписать в одну строку.

Если на хосте `localhost` не пробрасывается в контейнер (типичная Linux-проблема), используйте `--network host` или подставьте IP хоста в `DATABASE_URL` вместо `localhost` (на Linux чаще всего `172.17.0.1`, на Mac/Windows — `host.docker.internal`).

Expected: команда возвращает Container ID, контейнер запущен в фоне.

- [ ] **Step 2: Проверить логи запуска**

Run: `docker logs siblay-test`
Expected: видим в логах последовательно:
```
[entrypoint] Applying database migrations...
... (вывод prisma migrate deploy: либо "No pending migrations", либо список применённых)
[entrypoint] Starting Next.js server...
   ▲ Next.js 16.2.2
   - Local:        http://localhost:3000
   - Network:      http://0.0.0.0:3000
 ✓ Starting...
 ✓ Ready in ...ms
```

Если что-то пошло не так (миграция упала, не нашёл server.js) — смотреть точную ошибку.

- [ ] **Step 3: Проверить ответ HTTP**

Run: `curl -I http://localhost:3001`
Expected:
```
HTTP/1.1 200 OK
```

Или (если редирект на HTTPS — но для локального теста не должно быть):
```
HTTP/1.1 308 Permanent Redirect
Location: https://...
```

Если 200 — главная отрисована standalone-сервером, миграции прошли, всё работает.

- [ ] **Step 4: Остановить контейнер**

Run: `docker stop siblay-test`
Expected: команда возвращает имя контейнера.

(Контейнер запущен с `--rm`, поэтому удалится автоматически после остановки.)

---

## Task 8: Push ветки и подготовка к деплою

**Files:** нет правок, только git-операции.

- [ ] **Step 1: Слить dev → master (или оставить деплой с dev)**

Coolify может деплоить с любой ветки. Решите:

- **Вариант A:** Деплоим с `dev` напрямую — проще, для одного разработчика подходит
- **Вариант B:** Сливаем `dev → master`, деплоим с `master` — более привычная схема

Если выбран Вариант B:
```bash
git checkout master
git merge dev
git push origin master
git checkout dev
```

Если Вариант A — просто:
```bash
git push origin dev
```

- [ ] **Step 2: Проверить, что push прошёл**

Run: `git status`
Expected: `Your branch is up to date with 'origin/<branch>'.`

---

## Task 9: Настройка Coolify (UI-задача, выполняет пользователь)

**Это не subagent-задача** — настройку нужно сделать в браузере. Описана для полноты.

- [ ] **Step 1: Создать Postgres сервис**

В Coolify:
- New Resource → Database → PostgreSQL → версия 16
- Указать имя (например `siblay-postgres`)
- После создания — открыть и скопировать **Internal connection URL** (формата `postgresql://postgres:<password>@siblay-postgres:5432/postgres`)

- [ ] **Step 2: Создать приложение**

В Coolify:
- New Resource → выбрать тип репозитория (Public/Private/Git)
- Указать URL репозитория и ветку (`dev` или `master` в зависимости от Task 8)
- **Build Pack: Dockerfile** (важно — не Nixpacks)
- Dockerfile Location: `/Dockerfile`
- Base Directory: `/`
- Port (Internal): `3000`

- [ ] **Step 3: Заполнить Build Variables**

В разделе **Build Variables** (НЕ Environment Variables):

```
NEXT_PUBLIC_SITE_URL=https://siblay.ru
NEXT_PUBLIC_YANDEX_METRIKA_ID=109131648
```

Важно: эти переменные подставляются при `docker build` через `--build-arg`. Если положить их в Environment Variables — они не запекутся в JS-бандл, и Метрика не подключится.

- [ ] **Step 4: Заполнить Environment Variables**

В разделе **Environment Variables**:

```
DATABASE_URL=<Internal URL из Step 1>
NODE_ENV=production
BETTER_AUTH_SECRET=<сгенерировать новый: openssl rand -base64 32>
BETTER_AUTH_URL=https://siblay.ru
ADMIN_EMAIL=<ваш админ-email>
ADMIN_PASSWORD=<сильный пароль>
AWS_REGION=<регион Beget>
AWS_ACCESS_KEY_ID=<ключ>
AWS_SECRET_ACCESS_KEY=<секрет>
AWS_S3_BUCKET=<имя бакета>
TELEGRAM_BOT_TOKEN=<токен>
TELEGRAM_CHAT_ID=<id чата>
```

`NEXT_PUBLIC_*` тоже добавьте сюда — они нужны и на runtime для согласованности (например для `metadataBase` в layout).

- [ ] **Step 5: Настроить домен**

- В разделе Domains → добавить `siblay.ru`
- Включить **Force HTTPS**
- Дождаться, пока Coolify выпустит Let's Encrypt сертификат (обычно 30–60 секунд)

- [ ] **Step 6: Healthcheck (опционально)**

В разделе Healthcheck:
- Path: `/`
- Method: GET
- Interval: 30s
- Timeout: 10s
- Retries: 3

Coolify по умолчанию проверяет, что контейнер слушает на указанном порту, но healthcheck даёт более точный сигнал.

- [ ] **Step 7: Запустить деплой**

- Кнопка `Deploy`
- Открыть Logs в реальном времени

Expected:
- В логах сборки: успешное прохождение всех stage'ов Dockerfile
- В логах рантайма: `[entrypoint] Applying database migrations...` → `Applying migration "<timestamp>_init"` → `[entrypoint] Starting Next.js server...` → `Ready in ...ms`
- Статус приложения в Coolify: **Running** (зелёный)

---

## Task 10: Финальное приёмочное тестирование

**Files:** нет правок, только верификация на проде.

- [ ] **Step 1: HTTPS и сертификат**

Open: `https://siblay.ru`
Expected:
- Страница открывается
- В адресной строке замок (валидный сертификат Let's Encrypt)
- Никаких mixed-content предупреждений

- [ ] **Step 2: Cookie-баннер и Метрика**

Действия:
1. Открыть в инкогнито: `https://siblay.ru`
2. Дождаться появления cookie-баннера
3. Нажать «Принять все»
4. DevTools → Network → искать запрос к `mc.yandex.ru/metrika/tag.js?id=109131648`

Expected: запрос есть, статус 200.

- [ ] **Step 3: SPA-навигация**

Действия:
1. Перейти с главной на `/portfolio`
2. DevTools → Network → искать запрос к `mc.yandex.ru/watch/109131648`

Expected: запрос есть — это второй pageview через `usePageviewTracking`.

- [ ] **Step 4: Создание тестового заказа**

Действия:
1. Открыть `/order`
2. Заполнить форму с тестовыми данными
3. Отправить

Expected:
- Форма принимает данные без ошибок
- В Coolify → ваше приложение → Terminal → выполнить `psql $DATABASE_URL -c "SELECT id, status, fullName FROM \"Order\" ORDER BY \"createdAt\" DESC LIMIT 5;"` — видим ваш тестовый заказ

(Прямую команду `psql` вызвать через Coolify Execute или Terminal сервиса Postgres.)

- [ ] **Step 5: Telegram-уведомление (если настроено)**

Если форма заказа отправляет уведомление в Telegram (`lib/notifications.ts`), проверить, что сообщение пришло в указанный `TELEGRAM_CHAT_ID`.

- [ ] **Step 6: Health-check Coolify**

В Coolify → ваше приложение → Health Status: `Healthy`. Если `Unhealthy` — посмотреть логи healthcheck'а, скорректировать path.

---

## Self-Review Checklist (после реализации)

После выполнения Tasks 1–7 (subagent-задачи) и 8–10 (пользовательские) убедиться:

- [ ] `next.config.ts` содержит `output: 'standalone'`
- [ ] Папка `prisma/migrations/` закоммичена с init-миграцией
- [ ] `.dockerignore`, `Dockerfile`, `docker/entrypoint.sh` закоммичены
- [ ] Локальный `docker build` проходит без ошибок
- [ ] Образ ~150–300 МБ
- [ ] Локальный `docker run` поднимает приложение, главная отвечает 200
- [ ] Coolify задеплоил без ошибок
- [ ] HTTPS сертификат валиден
- [ ] Cookie-баннер работает, Метрика подключается после согласия
- [ ] Тестовый заказ создаётся, попадает в Postgres
