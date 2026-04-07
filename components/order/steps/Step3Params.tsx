"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import type { OrderFormData } from "@/lib/validations/order"

const INFILL_PRESETS = [
  { value: 20, label: "Лёгкий", desc: "Декор, макеты" },
  { value: 50, label: "Стандарт", desc: "Прототипы" },
  { value: 100, label: "Монолит", desc: "Нагрузочные детали" },
]

const DIMS = [
  { key: "length" as const, label: "Длина" },
  { key: "width" as const, label: "Ширина" },
  { key: "height" as const, label: "Высота" },
]

export function Step3Params() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<OrderFormData>()
  const infill = watch("infill") ?? 50
  const quantity = watch("quantity") ?? 1

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-foreground mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
          Параметры печати
        </h2>
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
        <p className="text-xs text-muted mt-2 font-mono">Максимум: 256×256×256 мм</p>
      </div>

      {/* Quantity */}
      <div>
        <p className="label-mono mb-3">Количество</p>
        <div className="inline-flex items-center rounded-xl border border-border bg-background overflow-hidden">
          <button
            type="button"
            onClick={() => setValue("quantity", Math.max(1, quantity - 1), { shouldValidate: true })}
            className="w-10 h-10 flex items-center justify-center text-lg text-muted hover:text-foreground hover:bg-border transition-colors"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={1000}
            {...register("quantity")}
            className="w-16 h-10 text-center text-sm font-mono font-bold text-foreground bg-transparent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setValue("quantity", Math.min(1000, quantity + 1), { shouldValidate: true })}
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
          <p className="label-mono">Заполнение (Infill)</p>
          <span
            className="text-sm font-black"
            style={{ fontFamily: "Syne, sans-serif", color: "var(--accent)" }}
          >
            {infill}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {INFILL_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setValue("infill", p.value, { shouldValidate: true })}
              className={cn(
                "py-3 px-2 rounded-xl border text-center transition-all duration-150",
                infill === p.value
                  ? "border-accent bg-(--accent-subtle)"
                  : "border-border bg-background hover:border-(--accent-border)",
              )}
            >
              <div className={cn(
                "text-base font-black mb-0.5",
                infill === p.value ? "text-accent" : "text-foreground",
              )}
                style={{ fontFamily: "Syne, sans-serif" }}
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
          onValueChange={([v]) => setValue("infill", v, { shouldValidate: true })}
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
