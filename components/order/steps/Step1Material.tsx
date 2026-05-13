'use client'

import { useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'

import type { MaterialWithColors } from '@/actions/materials'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn, formatMaterialPrice } from '@/lib/utils'
import type { OrderFormData } from '@/lib/validations/order'

interface Props {
  materials: MaterialWithColors[]
}

export function Step1Material({ materials }: Props) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<OrderFormData>()
  const selected = watch('material')

  const handleMaterialSelect = useCallback((mat: MaterialWithColors) => {
    setValue('material', mat.name, { shouldValidate: true })
    setValue('color', '')
  }, [])

  // Available materials first, then "Скоро". sortOrder breaks ties inside each group.
  const sortedMaterials = useMemo(
    () =>
      [...materials].sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1
        return a.sortOrder - b.sortOrder
      }),
    [materials],
  )

  return (
    <div>
      <h2 className="text-2xl font-black text-foreground mb-1 font-display">Выберите материал</h2>
      <p className="text-sm text-muted mb-6">
        От материала зависит прочность, внешний вид и цена изделия
      </p>
      <RadioGroup
        defaultValue={selected}
        onValueChange={(value) => {
          handleMaterialSelect(sortedMaterials.find((m) => m.name === value)!)
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {sortedMaterials.map((mat) => {
          const dotColor = mat.color || 'var(--muted)'
          const hasInfo = Boolean(mat.fullName || mat.tempLimit || mat.strength || mat.longDesc)

          return (
            <FieldLabel
              key={mat.id}
              htmlFor={mat.id}
              className="border-none"
              data-disabled={!mat.available}
            >
              <Field
                className={cn(
                  'h-full w-full rounded-xl border-2 text-left transition-all relative select-none bg-surface cursor-pointer hover:bg-background',
                  {
                    'border-accent bg-(--accent-subtle)!': selected === mat.name,
                    'opacity-60 cursor-not-allowed': !mat.available,
                  }
                )}
              >
                <FieldContent className="flex flex-col gap-2 items-start h-full">
                  <FieldTitle className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={
                        mat.color
                          ? { background: dotColor, boxShadow: `0 0 8px ${dotColor}66` }
                          : { background: dotColor }
                      }
                    />
                    <h3 className="font-black text-lg text-foreground font-display">{mat.name}</h3>
                    <div className="ml-auto flex items-center gap-1.5 shrink-0">
                      {hasInfo && <MaterialInfo mat={mat} />}
                      {!mat.available && (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-border text-muted">
                          Скоро
                        </span>
                      )}
                    </div>
                  </FieldTitle>
                  <p className="text-sm text-muted">{mat.description}</p>
                  <p className="text-xs font-mono text-muted">Лучше всего для: {mat.best}</p>
                  <p className="text-sm font-mono font-semibold text-accent mt-auto">{formatMaterialPrice(mat.price)}</p>
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

function MaterialInfo({ mat }: { mat: MaterialWithColors }) {
  const dotColor = mat.color || 'var(--muted)'
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
          <div className="size-2.5 rounded-full shrink-0" style={{ background: dotColor }} />
          <div>
            <p className="font-bold text-foreground font-display">{mat.name}</p>
            {mat.fullName && (
              <p className="text-xs text-muted font-mono">{mat.fullName}</p>
            )}
          </div>
        </div>

        {(mat.tempLimit || mat.strength) && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {mat.tempLimit && (
              <div className="rounded-lg bg-background px-3 py-2">
                <p className="text-[10px] text-muted font-mono uppercase tracking-wide mb-0.5">Темп.</p>
                <p className="text-xs font-semibold text-foreground">{mat.tempLimit}</p>
              </div>
            )}
            {mat.strength && (
              <div className="rounded-lg bg-background px-3 py-2">
                <p className="text-[10px] text-muted font-mono uppercase tracking-wide mb-0.5">
                  Прочность
                </p>
                <p className="text-xs font-semibold text-foreground">{mat.strength}</p>
              </div>
            )}
          </div>
        )}

        {mat.longDesc && (
          <p className="text-xs text-muted leading-relaxed">{mat.longDesc}</p>
        )}
      </PopoverContent>
    </Popover>
  )
}
