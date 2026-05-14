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
