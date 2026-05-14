import { describe, expect, it } from 'vitest'

import {
  DEFAULT_COST_PARAMS,
  calculateOrderCost,
  estimateOrderPrice,
  estimateWeightKg,
} from './pricing'

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

  it('не делит на ноль при шансе брака 100% и выше', () => {
    const result = calculateOrderCost({
      filamentPricePerKg: 1200,
      weightKg: 0.1,
      hours: 1,
      params: { ...DEFAULT_COST_PARAMS, defectRatePercent: 100 },
    })

    expect(Number.isFinite(result.total)).toBe(true)
    expect(result.total).toBeGreaterThan(0)
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
