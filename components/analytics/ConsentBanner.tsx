'use client'

import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { useConsent } from './ConsentProvider'

export function ConsentBanner() {
  const { consent, hasHydrated, setConsent } = useConsent()

  if (!hasHydrated) return null
  if (consent !== null) return null

  return (
    <div
      role="region"
      aria-label="Согласие на использование cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          Мы используем файлы cookie и Яндекс Метрику с Вебвизором, чтобы понимать,
          как вы пользуетесь сайтом и улучшать его. Подробнее в{' '}
          <Link href="/privacy" className="underline hover:text-foreground transition-colors">
            политике конфиденциальности
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConsent('declined')}
            aria-label="Отклонить использование cookies и аналитики"
          >
            Отклонить
          </Button>
          <Button
            size="sm"
            onClick={() => setConsent('accepted')}
            aria-label="Принять использование cookies и аналитики"
          >
            Принять все
          </Button>
        </div>
      </div>
    </div>
  )
}
