import { getSessionCookie } from 'better-auth/cookies'
import { NextRequest, NextResponse } from 'next/server'

import { createRateLimiter, getClientId } from '@/lib/rate-limit'

// Module-level state is safe here only because we deploy as a single Node
// process via `output: 'standalone'`. If proxy is ever pushed to a CDN edge
// or split across instances, swap this for an external store (Redis).
const globalLimiter = createRateLimiter({
  limit: 120,
  windowMs: 60 * 1000,
  name: 'global',
})

const ADMIN_PREFIX = '/admin'
const ADMIN_LOGIN = '/admin/login'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith(ADMIN_PREFIX) && pathname !== ADMIN_LOGIN) {
    // Cheap cookie presence check at the edge. Full validation (session
    // exists + email === ADMIN_EMAIL) still happens in the protected layout —
    // this just stops anonymous traffic from reaching admin pages at all.
    const sessionCookie = getSessionCookie(req)
    if (!sessionCookie) {
      const loginUrl = new URL(ADMIN_LOGIN, req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  const { allowed, retryAfter, remaining } = globalLimiter(getClientId(req.headers))
  if (!allowed) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    })
  }

  const res = NextResponse.next()
  res.headers.set('X-RateLimit-Remaining', String(remaining))
  return res
}

export const config = {
  // Skip Next internals, the Better Auth handler (which has its own rate
  // limit), and anything with a file extension (images, fonts, etc.).
  matcher: ['/((?!_next/|api/auth|.*\\.).*)'],
}
