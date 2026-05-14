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
  const safeDefectRate = Math.min(Math.max(params.defectRatePercent, 0), 99)
  const withDefect = costPrice / (1 - safeDefectRate / 100)
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
