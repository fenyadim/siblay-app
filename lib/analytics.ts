declare global {
  interface Window {
    ym?: (id: number, event: string, ...args: unknown[]) => void
  }
}

export const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  if (window.ym && yandexMetrikaId) {
    window.ym(Number(yandexMetrikaId), 'reachGoal', name, params)
  }
}

export {}
