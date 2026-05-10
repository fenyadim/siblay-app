'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'siblay-analytics-consent-v1'

export type ConsentValue = 'accepted' | 'declined' | null

type ConsentContextValue = {
  consent: ConsentValue
  hasHydrated: boolean
  setConsent: (value: 'accepted' | 'declined') => void
  resetConsent: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) {
    throw new Error('useConsent must be used within ConsentProvider')
  }
  return ctx
}

function readStoredConsent(): ConsentValue {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'accepted' || raw === 'declined') return raw
    return null
  } catch {
    return null
  }
}

function writeStoredConsent(value: ConsentValue) {
  if (typeof window === 'undefined') return
  try {
    if (value === null) {
      window.localStorage.removeItem(STORAGE_KEY)
    } else {
      window.localStorage.setItem(STORAGE_KEY, value)
    }
  } catch {
    // localStorage недоступен — молча игнорируем
  }
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<ConsentValue>(null)
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setConsentState(readStoredConsent())
    setHasHydrated(true)
  }, [])

  const setConsent = (value: 'accepted' | 'declined') => {
    writeStoredConsent(value)
    setConsentState(value)
  }

  const resetConsent = () => {
    writeStoredConsent(null)
    setConsentState(null)
  }

  return (
    <ConsentContext.Provider value={{ consent, hasHydrated, setConsent, resetConsent }}>
      {children}
    </ConsentContext.Provider>
  )
}
