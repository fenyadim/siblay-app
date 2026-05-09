'use client'

import { useConsent } from './ConsentProvider'

export function ConsentSettingsButton() {
  const { resetConsent } = useConsent()

  return (
    <button
      type="button"
      onClick={resetConsent}
      className="text-muted hover:text-accent transition-colors"
    >
      Настройки cookies
    </button>
  )
}
