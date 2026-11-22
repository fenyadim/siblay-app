'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import type { MaterialWithColors } from '@/actions/materials'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { OrderFormData } from '@/lib/validations/order'

interface Props {
  materials: MaterialWithColors[]
}

export function Step2Color({ materials }: Props) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<OrderFormData>()
  const material = watch('material')
  const selectedColor = watch('color')

  const matData = materials.find((m) => m.name === material)
  const colors = matData?.colors ?? []
  const selectedColorData = colors.find((c) => c.name === selectedColor)
  const customColor =
    !selectedColorData && /^#[0-9a-f]{6}$/i.test(selectedColor) ? selectedColor : null
  const pickerColor = customColor ?? '#000000'

  function selectColor(color: string) {
    setValue('color', color, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-foreground mb-1 font-display">Выберите цвет</h2>
      <p className="text-sm text-muted mb-6">
        {colors.length > 0 ? 'Каталог цветов для ' : 'Палитра пока не заполнена для '}
        <span className="font-mono font-medium text-foreground">{material}</span>
      </p>

      {colors.length > 0 && (
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(96px,1fr))]">
          {colors.map((c) => (
            <button
              key={c.name}
              type="button"
              aria-pressed={selectedColor === c.name}
              onClick={() => selectColor(c.name)}
              className={cn(
                'color-card flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-full relative',
                selectedColor === c.name
                  ? 'border-accent bg-(--accent-subtle)'
                  : 'border-border bg-surface hover:border-(--accent-border)'
              )}
            >
              {!c.inStock && (
                <span className="absolute top-1.5 right-1.5 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-amber-500 text-white whitespace-nowrap leading-tight">
                  Заказ
                </span>
              )}
              <div
                className="w-9 h-9 rounded-full border border-black/10 shrink-0"
                style={{
                  background: c.hex2 ? `linear-gradient(135deg, ${c.hex}, ${c.hex2})` : c.hex,
                }}
              />
              <ScrollingText text={c.name} />
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-xl border border-border bg-surface p-4">
        <label htmlFor="order-custom-color" className="font-semibold text-foreground">
          Свой цвет
        </label>
        <p id="order-custom-color-hint" className="mt-1 text-sm text-muted">
          Укажите желаемый оттенок. Наличие и ближайший оттенок пластика согласуем после заявки.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Input
            id="order-custom-color"
            type="color"
            className="h-11 w-16 cursor-pointer px-1.5 py-1"
            value={pickerColor}
            onInput={(event) => selectColor(event.currentTarget.value)}
            aria-describedby="order-custom-color-hint"
          />
          <span className="font-mono text-sm text-foreground">{pickerColor.toUpperCase()}</span>
          {!customColor && (
            <Button type="button" variant="outline" onClick={() => selectColor(pickerColor)}>
              Выбрать этот цвет
            </Button>
          )}
        </div>
      </div>

      {/* Out-of-stock warning */}
      {selectedColorData && !selectedColorData.inStock && (
        <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-amber-500">
          <span className="text-white shrink-0 text-base leading-tight mt-0.5">⚠</span>
          <p className="text-sm text-white">
            Этого цвета нет в наличии, но его можно заказать. Срок изготовления может увеличиться на{' '}
            <strong>3–7 дней</strong>.
          </p>
        </div>
      )}

      {selectedColor && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted">
          <span>Выбрано:</span>
          <span className="font-medium text-foreground">
            {customColor ? customColor.toUpperCase() : selectedColor}
          </span>
          {selectedColorData && !selectedColorData.inStock && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500 text-white">
              под заказ
            </span>
          )}
        </div>
      )}

      {errors.color && <p className="mt-3 text-sm text-destructive">{errors.color.message}</p>}
    </div>
  )
}

function ScrollingText({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [scrollX, setScrollX] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const el = textRef.current
    if (!container || !el) return
    const overflow = el.scrollWidth - container.clientWidth
    setScrollX(overflow > 0 ? overflow : 0)
  }, [text])

  return (
    <div ref={containerRef} className="w-full overflow-hidden text-center">
      <span
        ref={textRef}
        className="scroll-text text-xs font-medium text-muted whitespace-nowrap inline-block"
        style={scrollX > 0 ? ({ '--scroll-x': `-${scrollX}px` } as React.CSSProperties) : undefined}
      >
        {text}
      </span>
    </div>
  )
}
