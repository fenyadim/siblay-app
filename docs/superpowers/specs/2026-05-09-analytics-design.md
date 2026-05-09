# Подключение веб-аналитики (Яндекс Метрика)

**Дата:** 2026-05-09
**Статус:** Утверждён, готов к плану реализации

## Цель

Подключить веб-аналитику к сайту siblay.ru для понимания поведения пользователей и эффективности страниц. Аналитика должна:

- Соответствовать 152-ФЗ — пользователь информирован, может отказаться
- Не блокировать first paint и не ухудшать Web Vitals
- Корректно отслеживать SPA-навигацию Next.js App Router (без неё фиксируется только первая страница)
- Иметь точку расширения для будущих счётчиков и кастомных событий

## Объём работы

**Включено:**

- Яндекс Метрика с Вебвизором, clickmap, trackLinks, accurateTrackBounce
- Cookie consent с двумя кнопками (Принять / Отклонить), persisted в localStorage
- Кнопка «Настройки cookies» в Footer для повторного открытия баннера
- SPA pageview трекинг через `usePathname` / `useSearchParams`
- Раздел про веб-аналитику в политике конфиденциальности (`app/(main)/privacy/page.tsx`)
- Env-переменная `NEXT_PUBLIC_YANDEX_METRIKA_ID` (при пустом значении — счётчик не подключается, всё работает как no-op)
- Helper `lib/analytics.ts` с типами `window.ym` и функцией `trackEvent` (для будущих кастомных событий, сегодня не вызывается)

**Явно вне scope:**

- Google Analytics — отказались из-за трансграничной передачи в США
- Любые другие счётчики (VK Pixel, Top.Mail.Ru, Hotjar)
- Custom events для ecommerce / отслеживания шагов визарда заказа
- Server-side прокси счётчика
- Отдельная страница «Cookie Policy» — раздела в основной политике достаточно

## Архитектура

### Файловая структура

```
components/analytics/
  ConsentProvider.tsx       — React Context, источник истины состояния согласия
  ConsentBanner.tsx          — баннер снизу экрана, виден если consent === null
  ConsentSettingsButton.tsx  — кнопка «Настройки cookies» в Footer
  YandexMetrika.tsx          — <Script> + init Метрики, рендерится при consent === 'accepted'
  AnalyticsLayer.tsx         — корневая сборка: Provider + Banner + Метрика + хук
  usePageviewTracking.ts     — отслеживает usePathname/useSearchParams, дёргает ym('hit')
lib/analytics.ts             — типизированные helpers и декларации window.ym
```

В `app/layout.tsx` вызывается только `<AnalyticsLayer />` — остальное инкапсулировано.

### Поток данных

1. `ConsentProvider` при монтировании читает `localStorage.getItem('siblay-analytics-consent-v1')` → `'accepted' | 'declined' | null`
2. Если `null` — `ConsentBanner` рендерится
3. При `consent === 'accepted'`:
   - монтируется `<YandexMetrika />` (если `NEXT_PUBLIC_YANDEX_METRIKA_ID` задан)
   - активируется `usePageviewTracking()`, фиксирует первую страницу и каждое изменение URL
4. При `consent === 'declined'` — никаких скриптов, баннер не показывается
5. Пользователь может через Footer → «Настройки cookies» сбросить консент → баннер появится снова

## Компоненты

### `ConsentProvider.tsx`

```ts
type ConsentValue = 'accepted' | 'declined' | null

type ConsentContextValue = {
  consent: ConsentValue
  setConsent: (value: 'accepted' | 'declined') => void
  resetConsent: () => void
}
```

**Поведение:**

- Ключ localStorage: `siblay-analytics-consent-v1` (версия в имени — для будущих ревизий)
- На сервере и до hydration — `consent === null` всегда
- Внутренний флаг `hasHydrated` — защищает от flash баннера до hydration
- `setConsent` пишет в localStorage и обновляет state
- `resetConsent` удаляет ключ и ставит `consent = null`
- При недоступности localStorage (приватный режим, отключён) — `try/catch`, считаем `consent = null`, баннер показывается каждый раз
- Невалидное значение в localStorage игнорируется
- `useConsent` хук бросает ошибку, если используется вне `ConsentProvider`

**Изменение решения через «Настройки cookies»:** если в текущей сессии счётчик уже загружен (был accepted, нажали declined через Footer), скрипты остаются активными до перезагрузки. На следующей загрузке скрипты не подключатся. Это приемлемо для MVP.

### `ConsentBanner.tsx`

**Размещение:** `fixed bottom-0 inset-x-0 z-50`, не блокирует контент целиком.

**Содержимое:**

- Текст: «Мы используем файлы cookie и Яндекс Метрику с Вебвизором, чтобы понимать, как вы пользуетесь сайтом и улучшать его. Подробнее в [политике конфиденциальности](/privacy).»
- Кнопки справа: `<Button variant="outline">Отклонить</Button>` и `<Button>Принять все</Button>`
- На мобильных кнопки в столбик

**Стилистика:**

- `bg-card border-t border-border` — спокойный, не контрастный
- Анимация появления: `animate-in slide-in-from-bottom-4 fade-in duration-300`
- Анимация исчезновения: `animate-out slide-out-to-bottom-4 fade-out`

**Поведение:**

- Не показывается до hydration
- Не показывается, если `consent !== null`
- Esc и клик вне баннера НЕ закрывают — это не модалка
- Не блокирует скролл и взаимодействие со страницей
- aria: `role="region" aria-label="Согласие на использование cookies"`

### `ConsentSettingsButton.tsx`

- Маленькая кнопка-ссылка в Footer рядом с ссылками на политику и согласие
- Текст: «Настройки cookies»
- Клик → `resetConsent()`

### `YandexMetrika.tsx`

```tsx
'use client'
const id = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
if (!id) return null

const safeId = String(id).replace(/[^a-zA-Z0-9-]/g, '')

return (
  <>
    <Script id="yandex-metrika" strategy="afterInteractive">
      {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
        ym(${safeId}, 'init', {
          defer: true,
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          webvisor: true
        });`}
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
```

**Параметры:**

- `strategy="afterInteractive"` — стандартная стратегия для аналитики
- `defer: true` в init — отключает автоматический первый hit, чтобы избежать дублей с SPA-трекингом
- ID санитизируется (`replace(/[^a-zA-Z0-9-]/g, '')`) перед инъекцией в `<Script>` — защита от случайных невалидных значений в env
- Возвращает `null` если ID не задан — безопасный no-op

### `usePageviewTracking.ts`

```ts
'use client'
export function usePageviewTracking(enabled: boolean) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!enabled) return
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '')
    if (typeof window.ym === 'function' && yandexMetrikaId) {
      window.ym(Number(yandexMetrikaId), 'hit', url)
    }
  }, [pathname, searchParams, enabled])
}
```

**Поведение:**

- На первый рендер после `enabled = true` — фиксирует текущую страницу
- На каждое изменение pathname или searchParams — фиксирует новую страницу
- Работает для: переходов по ссылкам, `router.push`, навигация назад/вперёд
- `useSearchParams` требует обёртки в `<Suspense>` — в `AnalyticsLayer` хук рендерится внутри `<Suspense fallback={null}>`, чтобы не ломать ISR (главная сейчас на ISR)
- Защита `typeof window.ym === 'function'` от race condition: consent дали, но скрипт ещё не загружен. Следующий tick поймает

### `lib/analytics.ts`

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
```

**Назначение:**

- TS-декларация для `window.ym` — иначе компилятор ругается на любое обращение
- `trackEvent` — точка входа для будущих кастомных событий, сегодня не вызывается из кода

### `AnalyticsLayer.tsx`

```tsx
'use client'
import { Suspense } from 'react'
import { ConsentProvider, useConsent } from './ConsentProvider'
import { ConsentBanner } from './ConsentBanner'
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

## Интеграция

### `app/layout.tsx`

```tsx
import { AnalyticsLayer } from '@/components/analytics/AnalyticsLayer'

// в <body>:
<ThemeProvider>
  {children}
  <AnalyticsLayer />
</ThemeProvider>
```

### Footer

Добавить `<ConsentSettingsButton />` рядом с существующими ссылками на политику конфиденциальности и согласие.

### Env

`.env`:
```
NEXT_PUBLIC_YANDEX_METRIKA_ID=
```

При пустом значении счётчик не подключается, баннер всё равно работает (но грузить будет нечего).

## Политика конфиденциальности

Добавить новый раздел в `app/(main)/privacy/page.tsx` после раздела 8 (Порядок сбора, хранения, передачи и других видов обработки персональных данных), перед текущим разделом 9. Существующие разделы 9 и далее сдвинуть на +1.

**Содержимое нового раздела «9. Использование сервисов веб-аналитики»:**

- 9.1. На Сайте используется сервис веб-аналитики **Яндекс Метрика** (включая Вебвизор) — оператор: ООО «Яндекс», 119021, Россия, Москва, ул. Льва Толстого, д. 16. Цели: анализ поведения пользователей, оценка эффективности сайта, запись действий пользователя в форме заказа.
- 9.2. Сервис автоматически собирает: IP-адрес, тип устройства, версия браузера, источник перехода, посещённые страницы, действия на сайте.
- 9.3. Данные передаются ООО «Яндекс» и обрабатываются согласно политике конфиденциальности оператора: https://yandex.ru/legal/confidential/
- 9.4. Использование сервиса осуществляется на основании согласия пользователя, выраженного при первом посещении Сайта через баннер cookies. Пользователь может изменить своё решение в любой момент через ссылку «Настройки cookies» в подвале Сайта.

Раздел 10 «Трансграничная передача» **не трогаем** — Метрика хранит данные в РФ.

## Приёмочное тестирование (ручное)

1. **Без env-переменной:** сборка проходит, баннер показывается, после согласия в DOM не появляется тег с Метрикой (no-op).
2. **С тестовым `NEXT_PUBLIC_YANDEX_METRIKA_ID=12345678`:** баннер → «Принять все» → в DOM появляется `<script src="https://mc.yandex.ru/...">`, в Network виден запрос к Метрике.
3. **SPA-переход** (главная → `/portfolio`): второй hit фиксируется (виден в DevTools Network как новый POST к Метрике).
4. **Отклонить → перезагрузка:** баннер не показывается, скрипты не подключены.
5. **Footer → «Настройки cookies»:** баннер появляется снова, можно сменить решение.
6. **Linkcheck:** ссылка на `/privacy` из баннера ведёт на политику, в которой есть раздел 9 про аналитику.
7. **Build:** `pnpm run build` проходит, ISR на главной не сломан (Suspense вокруг `usePageviewTracking` работает корректно).

## Open issues / будущие итерации

- Кастомные события (`trackEvent('order_completed', {...})`) — точка входа есть, конкретные события подключим в отдельном тикете
- Серверный прокси Метрики — если в будущем понадобится обход блокировщиков рекламы
- Если решим добавить второй счётчик — добавляем рядом с `YandexMetrika.tsx` файл `<NewCounter>.tsx`, подключаем в `AnalyticsLayer`. Текущая структура к этому готова.
