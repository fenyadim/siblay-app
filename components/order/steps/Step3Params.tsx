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

export function Step3Params() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<OrderFormData>()
  const infill = watch("infill") ?? 50
  const quantity = watch("quantity") ?? 1

  return (
    <div>
      <h2 className="text-2xl font-black text-[var(--foreground)] mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        Параметры печати
      </h2>
      <p className="text-sm text-[var(--muted)] mb-6">Укажите размеры изделия и желаемые параметры</p>

      {/* Dimensions */}
      <div className="mb-6">
        <h3 className="label-mono mb-3">Размеры (мм)</h3>
        <div className="grid grid-cols-3 gap-3">
          {(["length", "width", "height"] as const).map((dim) => (
            <div key={dim}>
              <Label className="text-xs text-[var(--muted)] mb-1.5 block capitalize">
                {dim === "length" ? "Длина" : dim === "width" ? "Ширина" : "Высота"}
              </Label>
              <Input
                type="number"
                min={1}
                max={1000}
                step={0.1}
                placeholder="мм"
                {...register(dim)}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] focus:border-[var(--accent)]"
              />
              {errors[dim] && (
                <p className="text-xs text-[var(--error)] mt-1">{errors[dim]?.message}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-6">
        <h3 className="label-mono mb-3">Количество</h3>
        <div className="flex items-center gap-3 max-w-[180px]">
          <button
            type="button"
            onClick={() => setValue("quantity", Math.max(1, quantity - 1), { shouldValidate: true })}
            className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)] transition-colors flex items-center justify-center font-bold"
          >
            −
          </button>
          <Input
            type="number"
            min={1}
            max={1000}
            {...register("quantity")}
            className="text-center bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => setValue("quantity", Math.min(1000, quantity + 1), { shouldValidate: true })}
            className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--accent)] transition-colors flex items-center justify-center font-bold"
          >
            +
          </button>
        </div>
        {errors.quantity && (
          <p className="text-xs text-[var(--error)] mt-1">{errors.quantity.message}</p>
        )}
      </div>

      {/* Infill */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="label-mono">Заполнение (Infill)</h3>
          <span className="font-mono font-bold text-[var(--accent)]">{infill}%</span>
        </div>

        <div className="flex gap-2 mb-4">
          {INFILL_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setValue("infill", p.value, { shouldValidate: true })}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg border text-xs font-medium transition-all",
                infill === p.value
                  ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent-border)]",
              )}
            >
              <div className="font-mono font-bold">{p.value}%</div>
              <div className="text-[10px] mt-0.5">{p.label}</div>
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
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[var(--muted)] font-mono">10%</span>
          <span className="text-xs text-[var(--muted)] font-mono">100%</span>
        </div>
      </div>
    </div>
  )
}
