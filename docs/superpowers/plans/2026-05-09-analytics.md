# Подключение Яндекс Метрики — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Подключить Яндекс Метрику с Вебвизором и cookie consent, корректно отслеживая SPA-навигацию Next.js App Router и не подключая скрипты до согласия пользователя.

**Architecture:** Каждый аспект — отдельный модуль в `components/analytics/`. `ConsentProvider` хранит состояние в localStorage, `ConsentBanner` — UI, `YandexMetrika` — `<Script>` с инициализацией (рендерится только при `consent === 'accepted'`), `usePageviewTracking` — SPA-трекинг через `usePathname`. Сборка в `AnalyticsLayer.tsx`, который монтируется один раз в `app/layout.tsx`.

**Tech Stack:** Next.js 16.2.2 (App Router) · React 19 · TypeScript · Tailwind v4 · `next/script` · localStorage · shadcn `Button`.

**Тестовая дисциплина:** Проект не использует unit-тесты (`pnpm test` = `tsc --noEmit`). Дисциплина:
1. Сначала пишем типы (контракт)
2. `pnpm run typecheck` после каждой реализации
3. В конце — ручное приёмочное тестирование по чек-листу из спеки

**Референс на спеку:** `docs/superpowers/specs/2026-05-09-analytics-design.md`

---

## Файловая структура

**Создать:**
- `lib/analytics.ts` — TS-декларация `window.ym`, env-константа, helper `trackEvent`
- `components/analytics/ConsentProvider.tsx` — Context, localStorage, hydration-флаг
- `components/analytics/ConsentBanner.tsx` — UI баннера снизу экрана
- `components/analytics/ConsentSettingsButton.tsx` — кнопка для Footer
- `components/analytics/YandexMetrika.tsx` — `<Script>` тег, инициализация
- `components/analytics/usePageviewTracking.ts` — хук на `usePathname`/`useSearchParams`
- `components/analytics/AnalyticsLayer.tsx` — корневая сборка с `<Suspense>`

**Модифицировать:**
- `app/layout.tsx` — подключить `<AnalyticsLayer />` внутри `<ThemeProvider>`
- `components/layout/Footer.tsx` — добавить `<ConsentSettingsButton />` рядом со ссылкой на политику
- `app/(main)/privacy/page.tsx` — вставить новый раздел 9 «Использование сервисов веб-аналитики», существующие 9-12 → 10-13
- `.env` — добавить пустую переменную `NEXT_PUBLIC_YANDEX_METRIKA_ID=`

---

## Task 1: `lib/analytics.ts` — типы и константы

**Files:**
- Create: `lib/analytics.ts`
- Modify: `.env` (добавить пустую переменную)

- [ ] **Step 1: Добавить env-переменную**

В файле `.env` добавить строку (значение пустое — счётчик не подключится, что и нужно для текущего этапа):

```
NEXT_PUBLIC_YANDEX_METRIKA_ID=
```

- [ ] **Step 2: Создать `lib/analytics.ts`**

```ts
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
```

Финальный `export {}` нужен, потому что TS требует, чтобы файл с `declare global` был модулем.

- [ ] **Step 3: Проверить компиляцию**

Run: `pnpm run typecheck`
Expected: PASS, без ошибок

- [ ] **Step 4: Commit**

```bash
git add lib/analytics.ts .env
git commit -m "feat(analytics): add Yandex Metrika env and type declarations"
```

> **Важно:** `.env` обычно в `.gitignore`. Перед коммитом проверьте: `cat .gitignore | grep ".env"`. Если `.env` игнорируется — НЕ коммитьте его, а вместо этого создайте `.env.example` со строкой `NEXT_PUBLIC_YANDEX_METRIKA_ID=` и закоммитьте только его.

---

## Task 2: `ConsentProvider` — состояние согласия

**Files:**
- Create: `components/analytics/ConsentProvider.tsx`

- [ ] **Step 1: Определить контракт (типы)**

Создать `components/analytics/ConsentProvider.tsx` с типами и Context:

```tsx
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
```

- [ ] **Step 2: Реализовать Provider**

Добавить ниже в том же файле:

```tsx
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
```

- [ ] **Step 3: Проверить компиляцию**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/analytics/ConsentProvider.tsx
git commit -m "feat(analytics): add ConsentProvider with localStorage persistence"
```

---

## Task 3: `ConsentBanner` — UI согласия

**Files:**
- Create: `components/analytics/ConsentBanner.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/analytics/ConsentBanner.tsx`:

```tsx
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
```

- [ ] **Step 2: Проверить компиляцию**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Проверить, что `Button` поддерживает `variant="outline"` и `size="sm"`**

Run (только для верификации, не редактируем):
```bash
grep -E "outline|sm" components/ui/button.tsx
```
Expected: оба значения присутствуют в `cva` определении вариантов. Если нет — посмотрите файл и используйте имеющиеся варианты.

- [ ] **Step 4: Commit**

```bash
git add components/analytics/ConsentBanner.tsx
git commit -m "feat(analytics): add ConsentBanner with accept/decline UI"
```

---

## Task 4: `ConsentSettingsButton` — кнопка для Footer

**Files:**
- Create: `components/analytics/ConsentSettingsButton.tsx`

- [ ] **Step 1: Создать компонент**

```tsx
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
```

Стилизация повторяет соседние ссылки в Footer (`text-muted hover:text-accent transition-colors`).

- [ ] **Step 2: Проверить компиляцию**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/analytics/ConsentSettingsButton.tsx
git commit -m "feat(analytics): add ConsentSettingsButton for footer"
```

---

## Task 5: `YandexMetrika` — `<Script>` с инициализацией

**Files:**
- Create: `components/analytics/YandexMetrika.tsx`

- [ ] **Step 1: Создать компонент**

```tsx
'use client'

import Script from 'next/script'

export function YandexMetrika() {
  const rawId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
  if (!rawId) return null

  const safeId = String(rawId).replace(/[^a-zA-Z0-9-]/g, '')
  if (!safeId) return null

  const initScript = `
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");

    ym(${safeId}, 'init', {
      defer: true,
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true
    });
  `

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {initScript}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${safeId}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  )
}
```

Заметки:
- `defer: true` — отключает автоматический первый hit, чтобы избежать дублей с `usePageviewTracking`
- `safeId` санитизирует ID от любых символов кроме букв/цифр/дефисов — защита от XSS если в env попало что-то странное
- Возвращаем `null` если ID пустой — компонент no-op

- [ ] **Step 2: Проверить компиляцию**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/analytics/YandexMetrika.tsx
git commit -m "feat(analytics): add YandexMetrika script component with Webvisor"
```

---

## Task 6: `usePageviewTracking` — SPA-трекинг

**Files:**
- Create: `components/analytics/usePageviewTracking.ts`

- [ ] **Step 1: Создать хук**

```ts
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
```

Заметки:
- `enabled` — пробрасывается из `AnalyticsLayer`, равен `consent === 'accepted'`
- Защита `typeof window.ym === 'function'` — на случай race condition: согласие дали до того, как скрипт Метрики загрузился. Следующий tick (например, при смене URL) поймает
- `usePathname` и `useSearchParams` — оба триггерят effect при изменении

- [ ] **Step 2: Проверить компиляцию**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/analytics/usePageviewTracking.ts
git commit -m "feat(analytics): add SPA pageview tracking hook"
```

---

## Task 7: `AnalyticsLayer` — корневая сборка

**Files:**
- Create: `components/analytics/AnalyticsLayer.tsx`

- [ ] **Step 1: Создать компонент**

```tsx
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
```

Заметки:
- `<Suspense>` нужен, потому что `useSearchParams` в `usePageviewTracking` отключает статическую генерацию без обёртки. Главная страница использует ISR (см. mem #163) — `<Suspense>` сохранит её
- `AnalyticsScripts` — внутренний клиентский компонент, имеет доступ к `useConsent()` после Provider

- [ ] **Step 2: Проверить компиляцию**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/analytics/AnalyticsLayer.tsx
git commit -m "feat(analytics): add AnalyticsLayer assembly with Suspense boundary"
```

---

## Task 8: Подключить `AnalyticsLayer` в `app/layout.tsx`

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Добавить импорт и использование**

В файле `app/layout.tsx`:

После существующих импортов добавить:

```tsx
import { AnalyticsLayer } from '@/components/analytics/AnalyticsLayer'
```

Внутри `<ThemeProvider>` — изменить:

```tsx
<ThemeProvider>{children}</ThemeProvider>
```

на:

```tsx
<ThemeProvider>
  {children}
  <AnalyticsLayer />
</ThemeProvider>
```

- [ ] **Step 2: Проверить компиляцию**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Запустить dev-сервер для smoke-теста**

Run: `pnpm dev`
Open: http://localhost:3000
Expected:
- Страница рендерится
- Снизу появляется баннер «Мы используем файлы cookie и Яндекс Метрику…»
- Никакого JS-runtime эррора в консоли браузера
- В Network нет запросов к `mc.yandex.ru` (env-переменная пустая, скрипт не должен подключаться даже после согласия)

Остановить dev-сервер (`Ctrl+C`).

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(analytics): mount AnalyticsLayer in root layout"
```

---

## Task 9: Добавить `ConsentSettingsButton` в Footer

**Files:**
- Modify: `components/layout/Footer.tsx`

- [ ] **Step 1: Импортировать и подключить**

В файле `components/layout/Footer.tsx` добавить импорт после существующих:

```tsx
import { ConsentSettingsButton } from '@/components/analytics/ConsentSettingsButton'
```

В блоке нижнего ряда (там где `<Link href="/privacy">Политика ПДн</Link>`) добавить кнопку рядом со ссылкой. Заменить:

```tsx
<div className="flex items-center gap-4 text-xs">
  <Link href="/privacy" className="text-muted hover:text-accent transition-colors">
    Политика ПДн
  </Link>
  <span className="text-muted font-mono">3D-печать · Моделирование · Постобработка</span>
</div>
```

на:

```tsx
<div className="flex items-center gap-4 text-xs">
  <Link href="/privacy" className="text-muted hover:text-accent transition-colors">
    Политика ПДн
  </Link>
  <ConsentSettingsButton />
  <span className="text-muted font-mono">3D-печать · Моделирование · Постобработка</span>
</div>
```

- [ ] **Step 2: Проверить компиляцию**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 3: Smoke-тест**

Run: `pnpm dev`
Open: http://localhost:3000
Verify:
- В подвале страницы появилась ссылка «Настройки cookies» рядом с «Политика ПДн»
- При клике на «Принять все» в баннере → баннер исчезает
- При клике на «Настройки cookies» в подвале → баннер появляется снова
- В localStorage (DevTools → Application → Local Storage) видна запись `siblay-analytics-consent-v1`

Остановить dev-сервер.

- [ ] **Step 4: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "feat(analytics): add cookie settings button to footer"
```

---

## Task 10: Обновить политику конфиденциальности

**Files:**
- Modify: `app/(main)/privacy/page.tsx`

- [ ] **Step 1: Вставить новый раздел 9**

В файле `app/(main)/privacy/page.tsx` найти строку:

```tsx
          <section className="space-y-3">
            <h2 className="text-lg font-bold">
              9. Перечень действий, производимых Оператором с полученными персональными данными
            </h2>
```

Перед этой `<section>` (после закрывающего `</section>` секции 8) вставить новый блок:

```tsx
          <section className="space-y-3">
            <h2 className="text-lg font-bold">9. Использование сервисов веб-аналитики</h2>
            <p>
              9.1. На Сайте используется сервис веб-аналитики <strong>Яндекс Метрика</strong>{' '}
              (включая Вебвизор) — оператор: ООО «Яндекс», 119021, Россия, Москва, ул. Льва
              Толстого, д. 16. Цели обработки: анализ поведения пользователей, оценка эффективности
              Сайта, запись действий пользователя в форме заказа.
            </p>
            <p>
              9.2. Сервис автоматически собирает следующие данные: IP-адрес, тип устройства, версия
              браузера, источник перехода, посещённые страницы, действия на сайте.
            </p>
            <p>
              9.3. Данные передаются ООО «Яндекс» и обрабатываются согласно политике
              конфиденциальности оператора, размещённой по адресу:{' '}
              <a
                href="https://yandex.ru/legal/confidential/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                https://yandex.ru/legal/confidential/
              </a>
              .
            </p>
            <p>
              9.4. Использование сервиса осуществляется на основании согласия пользователя,
              выраженного при первом посещении Сайта через баннер cookies. Пользователь может
              изменить своё решение в любой момент через ссылку «Настройки cookies» в подвале
              Сайта.
            </p>
          </section>
```

- [ ] **Step 2: Сдвинуть номера существующих разделов 9-12 → 10-13**

В том же файле:

Заменить заголовок текущего раздела 9:

```tsx
            <h2 className="text-lg font-bold">
              9. Перечень действий, производимых Оператором с полученными персональными данными
            </h2>
```

на:

```tsx
            <h2 className="text-lg font-bold">
              10. Перечень действий, производимых Оператором с полученными персональными данными
            </h2>
```

Также внутри этого раздела изменить нумерацию пунктов: `9.1.` → `10.1.`, `9.2.` → `10.2.`

Заменить заголовок текущего раздела 10:

```tsx
<h2 className="text-lg font-bold">10. Трансграничная передача персональных данных</h2>
```

на:

```tsx
<h2 className="text-lg font-bold">11. Трансграничная передача персональных данных</h2>
```

И нумерацию пунктов: `10.1.` → `11.1.`, `10.2.` → `11.2.`

Заменить заголовок раздела 11:

```tsx
<h2 className="text-lg font-bold">11. Конфиденциальность персональных данных</h2>
```

на:

```tsx
<h2 className="text-lg font-bold">12. Конфиденциальность персональных данных</h2>
```

Заменить заголовок раздела 12:

```tsx
<h2 className="text-lg font-bold">12. Заключительные положения</h2>
```

на:

```tsx
<h2 className="text-lg font-bold">13. Заключительные положения</h2>
```

И нумерацию: `12.1.` → `13.1.`, `12.2.` → `13.2.`, `12.3.` → `13.3.`

- [ ] **Step 3: Проверить компиляцию**

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 4: Smoke-тест**

Run: `pnpm dev`
Open: http://localhost:3000/privacy
Verify:
- Новый раздел 9 «Использование сервисов веб-аналитики» виден между разделом 8 и старым (теперь 10) разделом
- Все номера разделов идут последовательно: 1, 2, 3, ..., 13
- Внутренняя нумерация пунктов корректна (10.1., 10.2., 11.1., и т.д.)
- Ссылка на yandex.ru/legal/confidential открывается в новой вкладке

Остановить dev-сервер.

- [ ] **Step 5: Commit**

```bash
git add app/\(main\)/privacy/page.tsx
git commit -m "docs(privacy): add web analytics section about Yandex Metrika"
```

---

## Task 11: Финальное приёмочное тестирование

**Files:** нет правок, только верификация.

- [ ] **Step 1: Production build**

Run: `pnpm run build`
Expected: PASS, без ошибок и предупреждений про `useSearchParams` без `<Suspense>`

- [ ] **Step 2: Запустить production сервер**

Run: `pnpm start`
Open: http://localhost:3000

- [ ] **Step 3: Сценарий «Пустой ID»**

Состояние: env `NEXT_PUBLIC_YANDEX_METRIKA_ID` пустой.
Действия:
1. Открыть сайт в режиме инкогнито
2. Дождаться появления баннера
3. Нажать «Принять все»
4. Открыть DevTools → Network → фильтр по `mc.yandex`

Expected:
- Баннер появился и исчез после клика
- Network: запросов к `mc.yandex.ru` нет (потому что ID пустой — компонент `YandexMetrika` рендерит `null`)
- Console: ошибок нет

- [ ] **Step 4: Сценарий «С тестовым ID»**

Action: Установить временно для теста (например `12345678` — несуществующий ID, мы проверяем что скрипт пытается грузиться):

В `.env`:
```
NEXT_PUBLIC_YANDEX_METRIKA_ID=12345678
```

Перезапустить `pnpm start` (или сначала `pnpm run build` если переменные читаются на билд-тайме — для `NEXT_PUBLIC_*` это так).

Действия:
1. Открыть сайт в режиме инкогнито
2. Нажать «Принять все»
3. DevTools → Elements → искать `<script id="yandex-metrika">`
4. DevTools → Network → искать `tag.js` от `mc.yandex.ru`

Expected:
- В DOM появился `<script id="yandex-metrika">` с инициализатором
- Network: запрос к `https://mc.yandex.ru/metrika/tag.js` (может вернуть 404 для несуществующего ID — это норм для теста)
- В консоли может быть ошибка от Метрики про невалидный ID — игнорируем, важно что скрипт загрузился

- [ ] **Step 5: Сценарий «SPA-навигация»**

Действия (с тем же тестовым ID):
1. После «Принять все» перейти с главной на `/portfolio` (клик по ссылке в шапке)
2. DevTools → Network → искать запросы к `mc.yandex.ru/watch/...`

Expected:
- При первом посещении главной — есть hit
- При переходе на `/portfolio` — есть второй hit (отдельный запрос)
- Это подтверждает работу `usePageviewTracking`

- [ ] **Step 6: Сценарий «Отклонить»**

Действия:
1. Очистить localStorage (DevTools → Application → Local Storage → очистить)
2. Перезагрузить страницу
3. В баннере нажать «Отклонить»
4. Перезагрузить страницу

Expected:
- После «Отклонить» баннер исчез
- После перезагрузки баннер не появляется
- В DOM нет `<script id="yandex-metrika">`
- Network: нет запросов к `mc.yandex.ru`

- [ ] **Step 7: Сценарий «Управление cookies»**

Действия:
1. После предыдущего шага (consent = declined)
2. Кликнуть в подвале «Настройки cookies»

Expected:
- Баннер появляется снова
- Можно сменить решение

- [ ] **Step 8: Сценарий «Линк на политику»**

Действия:
1. Очистить localStorage, перезагрузить
2. В баннере кликнуть «политике конфиденциальности»

Expected:
- Открывается `/privacy`
- Виден новый раздел 9 «Использование сервисов веб-аналитики»

- [ ] **Step 9: Восстановить пустой ID**

Action: Вернуть `.env`:
```
NEXT_PUBLIC_YANDEX_METRIKA_ID=
```

Это финальное состояние — реальный ID пользователь подставит, когда зарегистрирует счётчик.

- [ ] **Step 10: Финальный коммит** (если что-то менялось — иначе пропустить)

Если меняли `.env` для тестов и используете `.env.example` (см. Task 1), убедитесь что финальный `.env.example` пустой:

```bash
git status
```

Если `.env` или `.env.example` модифицирован — закоммитить:

```bash
git add .env.example  # или .env, если он в репо
git commit -m "chore: ensure analytics env is empty in shared file"
```

---

## Self-Review Checklist

После реализации убедиться:

- [ ] Все 11 задач закоммичены отдельными коммитами
- [ ] `pnpm run build` проходит без ошибок
- [ ] Баннер появляется в инкогнито, исчезает после выбора, не показывается повторно
- [ ] «Настройки cookies» в подвале возвращает баннер
- [ ] Раздел 9 в политике корректно вставлен, нумерация последовательная (1-13)
- [ ] При пустом ID счётчик не подключается, но баннер работает
- [ ] При тестовом ID скрипт загружается, SPA-переходы фиксируются
