# Калькулятор себестоимости заказа — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить менеджеру калькулятор себестоимости заказа в админке и переписать клиентскую ориентировочную оценку на полную модель затрат.

**Architecture:** Единое ядро расчёта — чистая функция `calculateOrderCost` в новом `lib/pricing.ts`. Её используют два потребителя: клиентская оценка (`estimateOrderPrice`, дефолтные тарифы + оценка времени из веса) и админ-калькулятор (`CostCalculator`, все поля редактируемые). Параметры калькулятора нигде не сохраняются — менеджер подставляет итог в существующее поле «Стоимость».

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest (добавляется этим планом), Tailwind v4.

---

## Структура файлов

- **Создать** `vitest.config.ts` — конфиг тест-раннера с алиасом `@/`.
- **Создать** `lib/pricing.ts` — ядро расчёта: константы, типы, `calculateOrderCost`, `estimateWeightKg`, `estimateOrderPrice`.
- **Создать** `lib/pricing.test.ts` — юнит-тесты ядра.
- **Создать** `components/admin/CostCalculator.tsx` — сворачиваемый калькулятор с живой разбивкой.
- **Создать** `components/admin/OrderPricing.tsx` — обёртка: общее состояние поля «Стоимость» для `OrderPriceInput` и `CostCalculator`.
- **Изменить** `package.json` — добавить `vitest`, скрипт `test`.
- **Изменить** `lib/utils.ts` — удалить устаревший блок расчёта цены.
- **Изменить** `components/order/SummaryPanel.tsx` — перейти на `estimateOrderPrice`.
- **Изменить** `components/admin/OrderPriceInput.tsx` — сделать управляемым (значение приходит из props).
- **Изменить** `app/admin/(protected)/orders/[id]/page.tsx` — заменить `OrderPriceInput` на `OrderPricing`.

---

## Task 1: Подключить Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Установить vitest**

Run: `pnpm add -D vitest`
Expected: `vitest` появляется в `devDependencies`, установка без ошибок.

- [ ] **Step 2: Создать конфиг**

Создать `vitest.config.ts`:

```ts
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: Добавить скрипт test**

В `package.json` в секции `scripts` заменить строку `"test": "pnpm run typecheck",` на:

```json
    "test": "vitest run",
```

(Скрипт `typecheck` оставить без изменений — он используется отдельно для проверки типов.)

- [ ] **Step 4: Проверить, что раннер запускается**

Run: `pnpm exec vitest run --passWithNoTests`
Expected: PASS — `No test files found ... passWithNoTests` или аналогичное сообщение об успехе, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "chore: подключить vitest для юнит-тестов"
```

---

## Task 2: Ядро расчёта — `calculateOrderCost`

**Files:**
- Create: `lib/pricing.ts`
- Test: `lib/pricing.test.ts`

- [ ] **Step 1: Написать падающий тест**

Создать `lib/pricing.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { DEFAULT_COST_PARAMS, calculateOrderCost } from './pricing'

describe('calculateOrderCost', () => {
  it('считает полную себестоимость с браком, наценкой и налогом', () => {
    const result = calculateOrderCost({
      filamentPricePerKg: 1200,
      weightKg: 0.1,
      hours: 5,
      params: DEFAULT_COST_PARAMS,
    })

    expect(result.material).toBe(120)
    expect(result.electricity).toBe(15)
    expect(result.consumables).toBe(150)
    expect(result.depreciation).toBe(250)
    expect(result.printHour).toBe(500)
    expect(result.operator).toBe(500)
    expect(result.costPrice).toBe(1535)
    expect(result.withDefect).toBeCloseTo(1615.789, 2)
    expect(result.withMarkup).toBeCloseTo(1938.947, 2)
    expect(result.total).toBe(2191)
  })

  it('обнуляет почасовые статьи при времени 0', () => {
    const result = calculateOrderCost({
      filamentPricePerKg: 1200,
      weightKg: 0.1,
      hours: 0,
      params: {
        ...DEFAULT_COST_PARAMS,
        defectRatePercent: 0,
        markup: 1,
        taxPercent: 0,
      },
    })

    expect(result.electricity).toBe(0)
    expect(result.consumables).toBe(0)
    expect(result.depreciation).toBe(0)
    expect(result.printHour).toBe(0)
    expect(result.costPrice).toBe(620)
    expect(result.total).toBe(620)
  })
})
```

- [ ] **Step 2: Запустить тест — убедиться, что падает**

Run: `pnpm exec vitest run lib/pricing.test.ts`
Expected: FAIL — `Failed to resolve import "./pricing"` (файла ещё нет).

- [ ] **Step 3: Создать `lib/pricing.ts`**

Создать `lib/pricing.ts`:

```ts
// ── Order cost model ─────────────────────────────────────────────────

export interface CostParams {
  tariffPerKwh: number
  printerPowerKw: number
  consumablesPerHour: number
  defectRatePercent: number
  operatorFee: number
  depreciationPerHour: number
  printHourRate: number
  taxPercent: number
  markup: number
}

export interface CostInputs {
  filamentPricePerKg: number
  weightKg: number
  hours: number
  params: CostParams
}

export interface CostBreakdown {
  material: number
  electricity: number
  consumables: number
  depreciation: number
  printHour: number
  operator: number
  costPrice: number
  withDefect: number
  withMarkup: number
  total: number
}

/** Плотность материалов, г/см³. */
export const MATERIAL_DENSITY: Record<string, number> = {
  PLA: 1.24,
  ABS: 1.04,
  PETG: 1.27,
  Nylon: 1.15,
  Resin: 1.1,
  TPU: 1.21,
}

/** Цена филамента, р/кг — своя на каждый материал. */
export const FILAMENT_PRICE_PER_KG: Record<string, number> = {
  PLA: 1200,
  ABS: 1300,
  PETG: 1500,
  Nylon: 2500,
  Resin: 3500,
  TPU: 2200,
}

/** Тарифы и коэффициенты по умолчанию (из калькулятора менеджера). */
export const DEFAULT_COST_PARAMS: CostParams = {
  tariffPerKwh: 20,
  printerPowerKw: 0.15,
  consumablesPerHour: 30,
  defectRatePercent: 5,
  operatorFee: 500,
  depreciationPerHour: 50,
  printHourRate: 100,
  taxPercent: 13,
  markup: 1.2,
}

/** Средняя скорость печати для оценки времени из веса, г/час. */
const PRINT_SPEED_GRAMS_PER_HOUR = 15

/** Наценка за моделирование, если у клиента нет готовой 3D-модели. */
const MODELING_SURCHARGE = 1.5

/** Полная себестоимость заказа с разбивкой по статьям. */
export function calculateOrderCost(inputs: CostInputs): CostBreakdown {
  const { filamentPricePerKg, weightKg, hours, params } = inputs

  const material = filamentPricePerKg * weightKg
  const electricity = params.tariffPerKwh * params.printerPowerKw * hours
  const consumables = params.consumablesPerHour * hours
  const depreciation = params.depreciationPerHour * hours
  const printHour = params.printHourRate * hours
  const operator = params.operatorFee

  const costPrice =
    material + electricity + consumables + depreciation + printHour + operator
  const withDefect = costPrice / (1 - params.defectRatePercent / 100)
  const withMarkup = withDefect * params.markup
  const total = Math.round(withMarkup * (1 + params.taxPercent / 100))

  return {
    material,
    electricity,
    consumables,
    depreciation,
    printHour,
    operator,
    costPrice,
    withDefect,
    withMarkup,
    total,
  }
}
```

> Примечание: `PRINT_SPEED_GRAMS_PER_HOUR` и `MODELING_SURCHARGE` используются в Task 3 — добавлены сейчас, чтобы не редактировать файл повторно.

- [ ] **Step 4: Запустить тест — убедиться, что проходит**

Run: `pnpm exec vitest run lib/pricing.test.ts`
Expected: PASS — 2 теста зелёные.

- [ ] **Step 5: Commit**

```bash
git add lib/pricing.ts lib/pricing.test.ts
git commit -m "feat(pricing): ядро расчёта себестоимости заказа"
```

---

## Task 3: Оценка веса и клиентской цены

**Files:**
- Modify: `lib/pricing.ts`
- Test: `lib/pricing.test.ts`

- [ ] **Step 1: Дописать падающие тесты**

В конец `lib/pricing.test.ts` добавить:

```ts
describe('estimateWeightKg', () => {
  it('оценивает вес из габаритного объёма', () => {
    const weight = estimateWeightKg({
      material: 'PLA',
      width: 50,
      height: 50,
      length: 50,
      quantity: 1,
      infill: 100,
    })

    expect(weight).toBeCloseTo(0.155, 3)
  })

  it('масштабирует вес по количеству', () => {
    const base = {
      material: 'PLA',
      width: 50,
      height: 50,
      length: 50,
      infill: 100,
    }
    const one = estimateWeightKg({ ...base, quantity: 1 })
    const three = estimateWeightKg({ ...base, quantity: 3 })

    expect(three).toBeCloseTo(one * 3, 6)
  })
})

describe('estimateOrderPrice', () => {
  it('возвращает положительную цену', () => {
    const price = estimateOrderPrice({
      material: 'PLA',
      width: 50,
      height: 50,
      length: 50,
      quantity: 1,
      infill: 100,
      hasModel: true,
    })

    expect(price).toBeGreaterThan(0)
  })

  it('добавляет наценку за моделирование при hasModel=false', () => {
    const base = {
      material: 'PLA',
      width: 50,
      height: 50,
      length: 50,
      quantity: 1,
      infill: 100,
    }
    const withModel = estimateOrderPrice({ ...base, hasModel: true })
    const noModel = estimateOrderPrice({ ...base, hasModel: false })

    expect(noModel).toBe(Math.round(withModel * 1.5))
  })
})
```

Также обновить строку импорта в начале `lib/pricing.test.ts` на:

```ts
import {
  DEFAULT_COST_PARAMS,
  calculateOrderCost,
  estimateOrderPrice,
  estimateWeightKg,
} from './pricing'
```

- [ ] **Step 2: Запустить тесты — убедиться, что падают**

Run: `pnpm exec vitest run lib/pricing.test.ts`
Expected: FAIL — `estimateWeightKg is not exported` / `estimateOrderPrice is not exported`.

- [ ] **Step 3: Добавить функции в `lib/pricing.ts`**

В конец `lib/pricing.ts` добавить:

```ts
export interface OrderDimensions {
  material: string
  width: number
  height: number
  length: number
  quantity: number
  infill: number
}

/** Оценка веса заказа из габаритного объёма, кг. */
export function estimateWeightKg(dims: OrderDimensions): number {
  const density = MATERIAL_DENSITY[dims.material] ?? 1.24
  const volumeCm3 = (dims.width * dims.height * dims.length) / 1000
  const weightGrams =
    volumeCm3 * density * (dims.infill / 100) * dims.quantity
  return weightGrams / 1000
}

/** Клиентская ориентировочная цена — только итоговое число. */
export function estimateOrderPrice(
  dims: OrderDimensions & { hasModel: boolean }
): number {
  const weightKg = estimateWeightKg(dims)
  const hours = (weightKg * 1000) / PRINT_SPEED_GRAMS_PER_HOUR
  const filamentPricePerKg = FILAMENT_PRICE_PER_KG[dims.material] ?? 1200

  const { total } = calculateOrderCost({
    filamentPricePerKg,
    weightKg,
    hours,
    params: DEFAULT_COST_PARAMS,
  })

  return dims.hasModel ? total : Math.round(total * MODELING_SURCHARGE)
}
```

- [ ] **Step 4: Запустить все тесты — убедиться, что проходят**

Run: `pnpm exec vitest run lib/pricing.test.ts`
Expected: PASS — все 6 тестов зелёные.

- [ ] **Step 5: Commit**

```bash
git add lib/pricing.ts lib/pricing.test.ts
git commit -m "feat(pricing): оценка веса и клиентской цены заказа"
```

---

## Task 4: Перевести клиентскую форму на новое ядро

**Files:**
- Modify: `components/order/SummaryPanel.tsx:4`
- Modify: `components/order/SummaryPanel.tsx:26-36`
- Modify: `lib/utils.ts:8-47`

- [ ] **Step 1: Обновить импорты в `SummaryPanel.tsx`**

Заменить строку 4:

```tsx
import { calculatePrice, formatPrice, formatFileSize } from "@/lib/utils"
```

на:

```tsx
import { formatPrice, formatFileSize } from "@/lib/utils"
import { estimateOrderPrice } from "@/lib/pricing"
```

- [ ] **Step 2: Переключить расчёт цены**

В `SummaryPanel.tsx` заменить блок (строки 26-36):

```tsx
  const price = hasAllDims && material
    ? calculatePrice({
        material,
        width: Number(width),
        height: Number(height),
        length: Number(length),
        quantity: Number(quantity) || 1,
        infill: Number(infill) || 50,
        hasModel: hasModel ?? true,
      })
    : null
```

на:

```tsx
  const price = hasAllDims && material
    ? estimateOrderPrice({
        material,
        width: Number(width),
        height: Number(height),
        length: Number(length),
        quantity: Number(quantity) || 1,
        infill: Number(infill) || 50,
        hasModel: hasModel ?? true,
      })
    : null
```

- [ ] **Step 3: Удалить устаревший блок расчёта из `lib/utils.ts`**

Удалить строки 8-47 целиком — весь блок от `// ── Price calculation ──` до закрывающей `}` функции `calculatePrice` включительно:

```tsx
// ── Price calculation ────────────────────────────────────────────────
const MATERIAL_DENSITY: Record<string, number> = {
  PLA: 1.24,
  ABS: 1.04,
  PETG: 1.27,
  Nylon: 1.15,
  Resin: 1.1,
  TPU: 1.21,
}

const PRICE_PER_GRAM: Record<string, number> = {
  PLA: 2,
  ABS: 2.5,
  PETG: 3,
  Nylon: 4,
  Resin: 5,
  TPU: 4,
}

const MODELING_SURCHARGE = 1.5

export function calculatePrice(params: {
  material: string
  width: number
  height: number
  length: number
  quantity: number
  infill: number
  hasModel: boolean
}): number {
  const density = MATERIAL_DENSITY[params.material] ?? 1.24
  const pricePerGram = PRICE_PER_GRAM[params.material] ?? 2

  const volumeMm3 = params.width * params.height * params.length
  const volumeCm3 = volumeMm3 / 1000
  const weight = volumeCm3 * density * (params.infill / 100)
  const basePrice = weight * pricePerGram * params.quantity

  return Math.round(basePrice * (params.hasModel ? 1 : MODELING_SURCHARGE))
}
```

После удаления файл должен начинаться с функции `cn` (строки 1-6), затем сразу идёт `// ── Formatters ──` и `formatPrice`. Убедиться, что между ними одна пустая строка.

- [ ] **Step 4: Проверить типы**

Run: `pnpm typecheck`
Expected: PASS — нет ошибок. (Если `calculatePrice` где-то ещё импортируется — ошибка укажет файл; в проекте на момент написания плана единственный потребитель — `SummaryPanel.tsx`.)

- [ ] **Step 5: Commit**

```bash
git add components/order/SummaryPanel.tsx lib/utils.ts
git commit -m "feat(order): клиентская оценка цены по полной модели себестоимости"
```

---

## Task 5: Компонент `CostCalculator`

**Files:**
- Create: `components/admin/CostCalculator.tsx`

- [ ] **Step 1: Создать компонент**

Создать `components/admin/CostCalculator.tsx`:

```tsx
'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DEFAULT_COST_PARAMS,
  FILAMENT_PRICE_PER_KG,
  calculateOrderCost,
  estimateWeightKg,
  type OrderDimensions,
} from '@/lib/pricing'
import { formatPrice } from '@/lib/utils'

interface Props {
  orderParams: OrderDimensions
  onApply: (total: number) => void
}

function num(value: string): number {
  const parsed = parseFloat(value.replace(',', '.'))
  return isNaN(parsed) ? 0 : parsed
}

export function CostCalculator({ orderParams, onApply }: Props) {
  const [open, setOpen] = useState(false)

  const [weightKg, setWeightKg] = useState(
    estimateWeightKg(orderParams).toFixed(3)
  )
  const [hours, setHours] = useState('')
  const [filamentPricePerKg, setFilamentPricePerKg] = useState(
    String(FILAMENT_PRICE_PER_KG[orderParams.material] ?? 1200)
  )
  const [tariffPerKwh, setTariffPerKwh] = useState(
    String(DEFAULT_COST_PARAMS.tariffPerKwh)
  )
  const [printerPowerKw, setPrinterPowerKw] = useState(
    String(DEFAULT_COST_PARAMS.printerPowerKw)
  )
  const [consumablesPerHour, setConsumablesPerHour] = useState(
    String(DEFAULT_COST_PARAMS.consumablesPerHour)
  )
  const [defectRatePercent, setDefectRatePercent] = useState(
    String(DEFAULT_COST_PARAMS.defectRatePercent)
  )
  const [operatorFee, setOperatorFee] = useState(
    String(DEFAULT_COST_PARAMS.operatorFee)
  )
  const [depreciationPerHour, setDepreciationPerHour] = useState(
    String(DEFAULT_COST_PARAMS.depreciationPerHour)
  )
  const [printHourRate, setPrintHourRate] = useState(
    String(DEFAULT_COST_PARAMS.printHourRate)
  )
  const [taxPercent, setTaxPercent] = useState(
    String(DEFAULT_COST_PARAMS.taxPercent)
  )
  const [markup, setMarkup] = useState(String(DEFAULT_COST_PARAMS.markup))

  const breakdown = calculateOrderCost({
    filamentPricePerKg: num(filamentPricePerKg),
    weightKg: num(weightKg),
    hours: num(hours),
    params: {
      tariffPerKwh: num(tariffPerKwh),
      printerPowerKw: num(printerPowerKw),
      consumablesPerHour: num(consumablesPerHour),
      defectRatePercent: num(defectRatePercent),
      operatorFee: num(operatorFee),
      depreciationPerHour: num(depreciationPerHour),
      printHourRate: num(printHourRate),
      taxPercent: num(taxPercent),
      markup: num(markup),
    },
  })

  const fields: { label: string; value: string; set: (v: string) => void }[] = [
    { label: 'Вес заказа (кг)', value: weightKg, set: setWeightKg },
    { label: 'Время печати (ч)', value: hours, set: setHours },
    {
      label: 'Цена филамента (р/кг)',
      value: filamentPricePerKg,
      set: setFilamentPricePerKg,
    },
    { label: 'Тариф (р/кВт·ч)', value: tariffPerKwh, set: setTariffPerKwh },
    {
      label: 'Мощность принтера (кВт)',
      value: printerPowerKw,
      set: setPrinterPowerKw,
    },
    {
      label: 'Расходники (р/час)',
      value: consumablesPerHour,
      set: setConsumablesPerHour,
    },
    {
      label: 'Шанс брака (%)',
      value: defectRatePercent,
      set: setDefectRatePercent,
    },
    { label: 'Работа оператора (р)', value: operatorFee, set: setOperatorFee },
    {
      label: 'Амортизация (р/час)',
      value: depreciationPerHour,
      set: setDepreciationPerHour,
    },
    {
      label: 'За час печати (р/час)',
      value: printHourRate,
      set: setPrintHourRate,
    },
    { label: 'Налоги (%)', value: taxPercent, set: setTaxPercent },
    { label: 'Наценка / коэффициент', value: markup, set: setMarkup },
  ]

  const rows: { label: string; value: number }[] = [
    { label: 'Материал', value: breakdown.material },
    { label: 'Электричество', value: breakdown.electricity },
    { label: 'Расходники', value: breakdown.consumables },
    { label: 'Амортизация', value: breakdown.depreciation },
    { label: 'Час печати', value: breakdown.printHour },
    { label: 'Оператор', value: breakdown.operator },
    { label: 'Себестоимость', value: breakdown.costPrice },
    { label: 'С браком', value: breakdown.withDefect },
    { label: 'С наценкой', value: breakdown.withMarkup },
  ]

  return (
    <div className="rounded-lg border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
      >
        <span>Калькулятор себестоимости</span>
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          <div className="grid grid-cols-2 gap-3">
            {fields.map(({ label, value, set }) => (
              <label key={label} className="block">
                <span className="mb-1 block text-xs text-muted">{label}</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full font-mono text-sm"
                />
              </label>
            ))}
          </div>

          <div className="divide-y divide-border rounded-lg border border-border">
            {rows.map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between px-3 py-1.5 text-xs"
              >
                <span className="text-muted">{label}</span>
                <span className="font-mono text-foreground">
                  {formatPrice(value)}
                </span>
              </div>
            ))}
            <div className="flex justify-between px-3 py-2 text-sm font-bold">
              <span className="text-foreground">ИТОГ</span>
              <span className="font-mono text-accent">
                {formatPrice(breakdown.total)}
              </span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => onApply(breakdown.total)}
            className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--accent-hover)"
          >
            Подставить в Стоимость
          </Button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Проверить типы**

Run: `pnpm typecheck`
Expected: PASS — нет ошибок.

- [ ] **Step 3: Commit**

```bash
git add components/admin/CostCalculator.tsx
git commit -m "feat(admin): калькулятор себестоимости заказа"
```

---

## Task 6: Связать калькулятор с полем «Стоимость»

**Files:**
- Modify: `components/admin/OrderPriceInput.tsx`
- Create: `components/admin/OrderPricing.tsx`
- Modify: `app/admin/(protected)/orders/[id]/page.tsx`

- [ ] **Step 1: Сделать `OrderPriceInput` управляемым**

Заменить всё содержимое `components/admin/OrderPriceInput.tsx` на:

```tsx
"use client"

import { useEffect, useState, useTransition } from "react"
import { updateOrderPrice } from "@/actions/orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Props {
  orderId: string
  currentPrice: number | null
  value: string
  onValueChange: (value: string) => void
}

export function OrderPriceInput({ orderId, currentPrice, value, onValueChange }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(false)
  }, [value])

  const parsed = value.trim() === "" ? null : parseFloat(value.replace(",", "."))
  const isValid = value.trim() === "" || (!isNaN(parsed!) && parsed! >= 0)
  const hasChange = (parsed ?? null) !== currentPrice

  function handleSave() {
    if (!isValid) return
    startTransition(async () => {
      await updateOrderPrice(orderId, parsed)
      setSaved(true)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Input
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          disabled={isPending}
          placeholder="Введите сумму..."
          className="w-full rounded-lg border border-border bg-background text-foreground px-3 py-2 pr-10 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">
          ₽
        </span>
      </div>
      <Button
        type="button"
        onClick={handleSave}
        disabled={isPending || !isValid || !hasChange}
        className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-(--accent-hover) transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {isPending ? "Сохранение…" : saved ? "Сохранено ✓" : "Сохранить"}
      </Button>
    </div>
  )
}
```

Изменения: `value` и `onValueChange` приходят из props (компонент управляемый); внутренний `useState` для значения удалён; `saved` сбрасывается через `useEffect` при любом изменении `value` (в т.ч. когда значение подставил калькулятор).

- [ ] **Step 2: Создать обёртку `OrderPricing`**

Создать `components/admin/OrderPricing.tsx`:

```tsx
"use client"

import { useState } from "react"

import { CostCalculator } from "@/components/admin/CostCalculator"
import { OrderPriceInput } from "@/components/admin/OrderPriceInput"
import type { OrderDimensions } from "@/lib/pricing"

interface Props {
  orderId: string
  currentPrice: number | null
  orderParams: OrderDimensions
}

export function OrderPricing({ orderId, currentPrice, orderParams }: Props) {
  const [value, setValue] = useState(currentPrice?.toString() ?? "")

  return (
    <div className="space-y-4">
      <OrderPriceInput
        orderId={orderId}
        currentPrice={currentPrice}
        value={value}
        onValueChange={setValue}
      />
      <CostCalculator
        orderParams={orderParams}
        onApply={(total) => setValue(String(total))}
      />
    </div>
  )
}
```

- [ ] **Step 3: Подключить `OrderPricing` на странице заказа**

В `app/admin/(protected)/orders/[id]/page.tsx` заменить строку 6:

```tsx
import { OrderPriceInput } from "@/components/admin/OrderPriceInput"
```

на:

```tsx
import { OrderPricing } from "@/components/admin/OrderPricing"
```

Затем заменить строку 90:

```tsx
          <OrderPriceInput orderId={order.id} currentPrice={order.estimatedPrice} />
```

на:

```tsx
          <OrderPricing
            orderId={order.id}
            currentPrice={order.estimatedPrice}
            orderParams={{
              material: order.material,
              width: order.width,
              height: order.height,
              length: order.length,
              quantity: order.quantity,
              infill: order.infill,
            }}
          />
```

- [ ] **Step 4: Проверить типы**

Run: `pnpm typecheck`
Expected: PASS — нет ошибок.

- [ ] **Step 5: Commit**

```bash
git add components/admin/OrderPriceInput.tsx components/admin/OrderPricing.tsx "app/admin/(protected)/orders/[id]/page.tsx"
git commit -m "feat(admin): встроить калькулятор себестоимости в страницу заказа"
```

---

## Task 7: Финальная проверка

**Files:** —

- [ ] **Step 1: Прогнать тесты**

Run: `pnpm test`
Expected: PASS — все тесты `lib/pricing.test.ts` зелёные.

- [ ] **Step 2: Проверить типы**

Run: `pnpm typecheck`
Expected: PASS — нет ошибок.

- [ ] **Step 3: Собрать проект**

Run: `pnpm build`
Expected: PASS — сборка без ошибок, страница заказа в админке генерируется.

- [ ] **Step 4: Ручная проверка (опционально, требует запущенного dev-сервера и БД)**

Run: `pnpm dev`, открыть `/admin/orders/<id>` существующего заказа.
Проверить:
- блок «Калькулятор себестоимости» сворачивается/разворачивается;
- поля предзаполнены (вес из габаритов, цена филамента по материалу, тарифы — дефолты);
- разбивка и ИТОГ пересчитываются при изменении полей;
- «Подставить в Стоимость» записывает ИТОГ в поле, кнопка «Сохранить» становится активной;
- на клиентской форме заказа `/order` блок «Ориентировочная стоимость» показывает число.

- [ ] **Step 5: Commit (если были правки на шаге 4)**

```bash
git add -A
git commit -m "fix: правки по итогам ручной проверки калькулятора"
```

---

## Self-review

- **Покрытие спеки:** ядро расчёта (Task 2) + оценка веса/времени (Task 3) + админ-калькулятор (Task 5) + связь с полем «Стоимость» через обёртку (Task 6) + клиентский расчёт (Task 4) + Vitest (Task 1) + удаление старого `calculatePrice` (Task 4) — все разделы спеки покрыты.
- **Наценка за моделирование:** реализована в `estimateOrderPrice` (Task 3), только для клиентской оценки — соответствует спеке.
- **Согласованность типов:** `OrderDimensions`, `CostParams`, `CostInputs`, `CostBreakdown` определены в Task 2-3 и используются без расхождений в Task 5-6. `calculateOrderCost`, `estimateWeightKg`, `estimateOrderPrice` названы единообразно во всех тасках.
- **Плейсхолдеры:** отсутствуют — каждый шаг содержит полный код или точную команду.
