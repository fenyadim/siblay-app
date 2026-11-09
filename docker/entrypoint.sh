#!/bin/sh
set -e

echo "[entrypoint] Applying database migrations..."
prisma migrate deploy
node /opt/prisma-runner/sync-admin.mjs

echo "[entrypoint] Starting Next.js server..."
exec node server.js
