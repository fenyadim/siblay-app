#!/bin/sh
set -e

echo "[entrypoint] Applying database migrations..."
prisma migrate deploy

echo "[entrypoint] Starting Next.js server..."
exec node server.js
