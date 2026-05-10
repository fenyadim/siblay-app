# syntax=docker/dockerfile:1.7

# ─── Stage 1: deps ────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile

# ─── Stage 2: builder ─────────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable
WORKDIR /app

ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID
ARG DATABASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# app/generated/prisma в .gitignore, на свежем clone её нет → регенерируем.
RUN pnpm prisma generate

RUN pnpm build

# ─── Stage 3: runner ──────────────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

# Standalone Next.js bundle (содержит свой node_modules с runtime-зависимостями)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma: schema + migrations + config for migrate deploy
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Prisma client (custom output, includes runtime — нет отдельного query-engine
# binary, т.к. используется @prisma/adapter-pg)
COPY --from=builder --chown=nextjs:nodejs /app/app/generated/prisma ./app/generated/prisma

# Prisma CLI + dotenv в отдельной директории (не /app/node_modules — там
# pnpm-style symlinks из standalone бандла, npm не может с ними работать).
# NODE_PATH ниже подключает эту директорию к module resolution, чтобы
# prisma.config.ts мог импортировать `prisma/config` и `dotenv/config`.
RUN mkdir -p /opt/prisma-runner \
  && cd /opt/prisma-runner \
  && npm init -y > /dev/null \
  && npm install --no-package-lock prisma@7.6.0 dotenv@17.4.0 \
  && chown -R nextjs:nodejs /opt/prisma-runner \
  && npm cache clean --force

# Entrypoint
COPY --chown=nextjs:nodejs docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod +x ./docker/entrypoint.sh

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_PATH="/opt/prisma-runner/node_modules"
ENV PATH="/opt/prisma-runner/node_modules/.bin:${PATH}"

EXPOSE 3000

ENTRYPOINT ["./docker/entrypoint.sh"]
