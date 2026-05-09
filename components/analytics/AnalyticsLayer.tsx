'use client'

import { Suspense } from 'react'

import { ConsentBanner } from './ConsentBanner'
import { ConsentProvider, useConsent } from './ConsentProvider'
import { YandexMetrika } from './YandexMetrika'
import { usePageviewTracking } from './usePageviewTracking'

function AnalyticsScripts() {
  const { consent } = useConsent()
  usePageviewTracking(consent === 'accepted')
  if (consent !== 'accepted') return null
  return <YandexMetrika />
}

export function AnalyticsLayer() {
  return (
    <ConsentProvider>
      <Suspense fallback={null}>
        <AnalyticsScripts />
      </Suspense>
      <ConsentBanner />
    </ConsentProvider>
  )
}
