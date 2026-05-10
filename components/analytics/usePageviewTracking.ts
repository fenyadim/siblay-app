'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { yandexMetrikaId } from '@/lib/analytics'

export function usePageviewTracking(enabled: boolean) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!enabled) return
    if (!yandexMetrikaId) return

    const queryString = searchParams.toString()
    const url = pathname + (queryString ? `?${queryString}` : '')

    if (typeof window.ym === 'function') {
      window.ym(Number(yandexMetrikaId), 'hit', url)
    }
  }, [pathname, searchParams, enabled])
}
