#!/bin/sh
set -e

# Try to run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "[entrypoint] Applying database migrations..."
  # Use the prisma CLI from the standalone bundle's node_modules
  if [ -f "node_modules/.bin/prisma" ]; then
    node_modules/.bin/prisma migrate deploy
  elif command -v prisma &> /dev/null; then
    prisma migrate deploy
  else
    echo "[entrypoint] Warning: Could not find prisma CLI"
  fi
else
  echo "[entrypoint] Skipping migrations - DATABASE_URL not set"
fi

echo "[entrypoint] Starting Next.js server..."
exec node server.js
