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
