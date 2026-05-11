/**
 * In-memory per-key rate limiter — fixed window.
 *
 * Works for a single Node process (one Docker container). If the app is ever
 * scaled to multiple instances, swap the Map for a shared store (Redis/Upstash)
 * — only the storage layer changes, the public API stays the same.
 */

export type RateLimitResult = {
  allowed: boolean
  retryAfter: number
  remaining: number
}

export type RateLimiter = (key: string) => RateLimitResult

type Entry = { count: number; resetAt: number }

type Options = {
  /** Max requests allowed within the window. */
  limit: number
  /** Window length in milliseconds. */
  windowMs: number
  /**
   * Optional name used to namespace keys, so the same client IP can have
   * independent buckets per limiter (e.g. "upload", "order", "global").
   */
  name?: string
}

const MAX_ENTRIES = 10_000

export function createRateLimiter({ limit, windowMs, name }: Options): RateLimiter {
  const store = new Map<string, Entry>()
  const prefix = name ? `${name}:` : ''

  return function check(key: string): RateLimitResult {
    const now = Date.now()
    const id = `${prefix}${key}`
    const entry = store.get(id)

    if (!entry || entry.resetAt < now) {
      // Cheap GC: drop the oldest entry when bound is hit. Prevents unbounded
      // memory growth from one-shot bot IPs.
      if (store.size >= MAX_ENTRIES) {
        const oldest = store.keys().next().value
        if (oldest !== undefined) store.delete(oldest)
      }
      store.set(id, { count: 1, resetAt: now + windowMs })
      return { allowed: true, retryAfter: 0, remaining: limit - 1 }
    }

    if (entry.count >= limit) {
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
        remaining: 0,
      }
    }

    entry.count++
    return { allowed: true, retryAfter: 0, remaining: limit - entry.count }
  }
}

/**
 * Extract a stable client identifier from request headers.
 *
 * Preference: x-real-ip → first x-forwarded-for → user-agent → "unknown".
 * The UA fallback prevents every header-stripping client from sharing one
 * global bucket; "unknown" is the last resort and should be rare in prod
 * behind a reverse proxy.
 */
export function getClientId(headers: Headers): string {
  const realIp = headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (forwarded) return forwarded

  return headers.get('user-agent')?.trim() || 'unknown'
}
