'use client'

import { Popover } from 'radix-ui'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { OrderFormData } from '@/lib/validations/order'

const INFILL_PRESETS = [
  { value: 20, label: 'Лёгкий', desc: 'Декор, макеты' },
  { value: 50, label: 'Стандарт', desc: 'Прототипы' },
  { value: 100, label: 'Монолит', desc: 'Нагрузочные детали' },
]

const DIMS = [
  { key: 'length' as const, label: 'Длина' },
  { key: 'width' as const, label: 'Ширина' },
  { key: 'height' as const, label: 'Высота' },
]

export function Step3Params() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<OrderFormData>()
  const infill = watch('infill') ?? 50
  const quantity = watch('quantity') ?? 1

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-foreground mb-1 font-display">Параметры печати</h2>
        <p className="text-sm text-muted">Укажите размеры изделия и желаемые параметры</p>
      </div>

      {/* Dimensions */}
      <div>
        <p className="label-mono mb-3">Размеры (мм)</p>
        <div className="grid grid-cols-3 gap-3">
          {DIMS.map(({ key, label }) => (
            <div key={key}>
              <Label className="text-xs text-muted mb-1.5 block">{label}</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                step={0.1}
                placeholder="0"
                {...register(key)}
                className="bg-background border-border text-foreground focus-visible:ring-0 focus-visible:border-accent transition-colors"
              />
              {errors[key] && (
                <p className="text-xs text-destructive mt-1">{errors[key]?.message}</p>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-2 font-mono">Максимум: 256x256x256 мм</p>
      </div>

      {/* Quantity */}
      <div>
        <p className="label-mono mb-3">Количество</p>
        <div className="inline-flex items-center rounded-xl border border-border bg-background overflow-hidden">
          <button
            type="button"
            onClick={() =>
              setValue('quantity', Math.max(1, quantity - 1), { shouldValidate: true })
            }
            className="w-10 h-10 flex items-center justify-center text-lg text-muted hover:text-foreground hover:bg-border transition-colors"
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={1000}
            {...register('quantity')}
            className="w-16 h-10 text-center text-sm font-mono font-bold text-foreground bg-transparent focus:outline-none"
          />
          <button
            type="button"
            onClick={() =>
              setValue('quantity', Math.min(1000, quantity + 1), { shouldValidate: true })
            }
            className="w-10 h-10 flex items-center justify-center text-lg text-muted hover:text-foreground hover:bg-border transition-colors"
          >
            +
          </button>
        </div>
        {errors.quantity && (
          <p className="text-xs text-destructive mt-1">{errors.quantity.message}</p>
        )}
      </div>

      {/* Infill */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="label-mono">Заполнение</p>
            <InfillInfo />
          </div>
          <span className="text-sm font-black font-display" style={{ color: 'var(--accent)' }}>
            {infill}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {INFILL_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setValue('infill', p.value, { shouldValidate: true })}
              className={cn(
                'py-3 px-2 rounded-xl border text-center transition-all duration-150',
                infill === p.value
                  ? 'border-accent bg-(--accent-subtle)'
                  : 'border-border bg-background hover:border-(--accent-border)'
              )}
            >
              <div
                className={cn(
                  'text-base font-black mb-0.5 font-display',
                  infill === p.value ? 'text-accent' : 'text-foreground'
                )}
              >
                {p.value}%
              </div>
              <div className="text-[11px] font-medium text-muted">{p.label}</div>
              <div className="text-[10px] text-muted mt-0.5">{p.desc}</div>
            </button>
          ))}
        </div>

        <Slider
          min={10}
          max={100}
          step={5}
          value={[infill]}
          onValueChange={([v]) => setValue('infill', v, { shouldValidate: true })}
          className="w-full"
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-muted font-mono">10%</span>
          <span className="text-xs text-muted font-mono">100%</span>
        </div>
      </div>
    </div>
  )
}

function InfillInfo() {
  const [open, setOpen] = useState(false)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center',
            'text-[10px] font-bold font-mono leading-none',
            'border transition-colors duration-150',
            open
              ? 'bg-accent border-accent text-white'
              : 'bg-background border-border text-muted hover:border-accent hover:text-accent'
          )}
          aria-label="Подробнее о заполнении"
        >
          ?
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={8}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            'z-50 w-72 rounded-xl border border-border bg-surface-raised shadow-xl',
            'p-4 text-sm',
            'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2'
          )}
        >
          <p className="font-bold text-foreground mb-1 font-display">Что такое заполнение?</p>
          <p className="text-xs text-muted leading-relaxed mb-3">
            Заполнение определяет, сколько материала будет внутри модели. Чем выше процент, тем
            прочнее и тяжелее деталь, но дольше печать и выше стоимость.
          </p>

          <div className="space-y-1.5 text-xs">
            <p className="text-muted">
              <span className="font-semibold text-foreground">10-30%</span> - для декора и
              ненагруженных деталей
            </p>
            <p className="text-muted">
              <span className="font-semibold text-foreground">40-60%</span> - универсальный вариант
              для большинства задач
            </p>
            <p className="text-muted">
              <span className="font-semibold text-foreground">70-100%</span> - для максимальной
              прочности и нагрузки
            </p>
          </div>

          <Popover.Arrow className="fill-border" width={12} height={6} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
