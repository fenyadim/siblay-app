import { cache } from 'react'
import { headers } from 'next/headers'

import { auth } from '@/lib/auth'

export async function hasAdminSession(requestHeaders: Headers) {
  const session = await auth.api.getSession({ headers: requestHeaders })
  return Boolean(session && session.user.email === process.env.ADMIN_EMAIL)
}

export const hasCurrentAdminSession = cache(async () => hasAdminSession(await headers()))
