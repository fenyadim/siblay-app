'use client'

import { useCallback } from 'react'
import { useFormContext } from 'react-hook-form'

import type { MaterialWithColors } from '@/actions/materials'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import type { OrderFormData } from '@/lib/validations/order'

interface Props {
  materials: MaterialWithColors[]
}

const MATERIAL_INFO: Record<
  string,
  { full: string; temp: string; strength: string; note: string; color: string }
> = {
  PLA: {
    full: 'Polylactic Acid',
    temp: 'до 60°C',
    strength: 'Средняя',
    note: 'Лучший выбор для начала. Легко печатается, экологичен, широкая палитра цветов. Не подходит для горячих сред.',
    color: '#01aeda',
  },
  PETG: {
    full: 'Polyethylene Terephthalate Glycol',
    temp: 'до 80°C',
    strength: 'Высокая',
    note: 'Сочетает гибкость и прочность. Подходит для пищевого контакта, химически стоек, слабо коробится.',
    color: '#8100cc',
  },
  TPU: {
    full: 'Thermoplastic Polyurethane',
    temp: 'до 80°C',
    strength: 'Эластичная',
    note: 'Резиноподобный. Идеален для прокладок, чехлов, амортизаторов. Выдерживает многократный изгиб без трещин.',
    color: '#0fe24f',
  },
  ABS: {
    full: 'Acrylonitrile Butadiene Styrene',
    temp: 'до 100°C',
    strength: 'Высокая',
    note: 'Классический инженерный пластик. Жёсткий, термостойкий, хорошо шлифуется. Требует закрытой камеры при печати.',
    color: '#d34107',
  },
  Nylon: {
    full: 'Polyamide (PA)',
    temp: 'до 120°C',
    strength: 'Очень высокая',
    note: 'Износостойкий, скользкий — отлично для шестерёнок и петель. Гигроскопичен, хранить в сухом месте.',
    color: '#3551f1',
  },
  Resin: {
    full: 'Фотополимерная смола',
    temp: 'до 60°C',
    strength: 'Средняя (хрупкая)',
    note: 'SLA/LCD печать с точностью 0.05 мм. Идеальная поверхность без следов слоёв. Подходит для ювелирки и фигурок.',
    color: '#a7a7a7',
  },
}

export function Step1Material({ materials }: Props) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<OrderFormData>()
  const selected = watch('material')

  const handleMaterialSelect = useCallback((mat: MaterialWithColors) => {
    setValue('material', mat.name as OrderFormData['material'], { shouldValidate: true })
    setValue('color', '')
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-black text-foreground mb-1 font-display">Выберите материал</h2>
      <p className="text-sm text-muted mb-6">
        От материала зависит прочность, внешний вид и цена изделия
      </p>
      <RadioGroup
        defaultValue={selected}
        onValueChange={(value) => {
          handleMaterialSelect(materials.find((m) => m.name === value)!)
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {materials.map((mat) => {
          const info = MATERIAL_INFO[mat.name]

          return (
            <FieldLabel
              key={mat.id}
              htmlFor={mat.id}
              className="border-none"
              data-disabled={!mat.available}
            >
              <Field
                className={cn(
                  'h-auto w-full rounded-xl border-2 text-left transition-all relative select-none bg-surface cursor-pointer hover:bg-background',
                  {
                    'border-accent bg-(--accent-subtle)!': selected === mat.name,
                    'opacity-60 cursor-not-allowed': !mat.available,
                  }
                )}
              >
                <FieldContent className="flex flex-col gap-2 items-start">
                  <FieldTitle className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: info.color, boxShadow: `0 0 8px ${info.color}66` }}
                    />
                    <h3 className="font-black text-lg text-foreground font-display">{mat.name}</h3>
                    <div className="ml-auto flex items-center gap-1.5 shrink-0">
                      {info && <MaterialInfo mat={mat} info={info} />}
                      {!mat.available && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-border text-muted">
                          Скоро
                        </span>
                      )}
                    </div>
                  </FieldTitle>
                  <p className="text-sm text-muted mb-2">{mat.description}</p>
                  <p className="text-xs font-mono text-muted mb-1">Лучше всего для: {mat.best}</p>
                  <p className="text-sm font-mono font-semibold text-accent">{mat.price}</p>
                </FieldContent>
                <RadioGroupItem
                  id={mat.id}
                  value={mat.name}
                  disabled={!mat.available}
                  aria-label={`Выбрать материал ${mat.name}`}
                  hidden
                />
              </Field>
            </FieldLabel>
          )
        })}
      </RadioGroup>
      {errors.material && (
        <p className="mt-3 text-sm text-destructive">{errors.material.message}</p>
      )}
    </div>
  )
}

function MaterialInfo({
  mat,
  info,
}: {
  mat: MaterialWithColors
  info: NonNullable<(typeof MATERIAL_INFO)[string]>
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-xs"
          className="rounded-full text-xs"
          disabled={!mat.available}
        >
          ?
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex items-center gap-2 mb-3">
          <div className="size-2.5 rounded-full shrink-0" style={{ background: info.color }} />
          <div>
            <p className="font-bold text-foreground font-display">{mat.name}</p>
            <p className="text-xs text-muted font-mono">{info.full}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg bg-background px-3 py-2">
            <p className="text-[10px] text-muted font-mono uppercase tracking-wide mb-0.5">Темп.</p>
            <p className="text-xs font-semibold text-foreground">{info.temp}</p>
          </div>
          <div className="rounded-lg bg-background px-3 py-2">
            <p className="text-[10px] text-muted font-mono uppercase tracking-wide mb-0.5">
              Прочность
            </p>
            <p className="text-xs font-semibold text-foreground">{info.strength}</p>
          </div>
        </div>

        {/* Note */}
        <p className="text-xs text-muted leading-relaxed">{info.note}</p>
      </PopoverContent>
    </Popover>
  )
}
