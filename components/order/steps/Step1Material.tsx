"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Popover } from "radix-ui"
import { cn } from "@/lib/utils"
import type { OrderFormData } from "@/lib/validations/order"
import type { MaterialWithColors } from "@/actions/materials"

interface Props {
  materials: MaterialWithColors[]
}

const MATERIAL_INFO: Record<string, { full: string; temp: string; strength: string; note: string }> = {
  PLA: {
    full: "Polylactic Acid",
    temp: "до 60°C",
    strength: "Средняя",
    note: "Лучший выбор для начала. Легко печатается, экологичен, широкая палитра цветов. Не подходит для горячих сред.",
  },
  PETG: {
    full: "Polyethylene Terephthalate Glycol",
    temp: "до 80°C",
    strength: "Высокая",
    note: "Сочетает гибкость и прочность. Подходит для пищевого контакта, химически стоек, слабо коробится.",
  },
  TPU: {
    full: "Thermoplastic Polyurethane",
    temp: "до 80°C",
    strength: "Эластичная",
    note: "Резиноподобный. Идеален для прокладок, чехлов, амортизаторов. Выдерживает многократный изгиб без трещин.",
  },
  ABS: {
    full: "Acrylonitrile Butadiene Styrene",
    temp: "до 100°C",
    strength: "Высокая",
    note: "Классический инженерный пластик. Жёсткий, термостойкий, хорошо шлифуется. Требует закрытой камеры при печати.",
  },
  Nylon: {
    full: "Polyamide (PA)",
    temp: "до 120°C",
    strength: "Очень высокая",
    note: "Износостойкий, скользкий — отлично для шестерёнок и петель. Гигроскопичен, хранить в сухом месте.",
  },
  Resin: {
    full: "Фотополимерная смола",
    temp: "до 60°C",
    strength: "Средняя (хрупкая)",
    note: "SLA/LCD печать с точностью 0.05 мм. Идеальная поверхность без следов слоёв. Подходит для ювелирки и фигурок.",
  },
}

export function Step1Material({ materials }: Props) {
  const { watch, setValue, formState: { errors } } = useFormContext<OrderFormData>()
  const selected = watch("material")

  return (
    <div>
      <h2
        className="text-2xl font-black text-foreground mb-1 font-display"
      >
        Выберите материал
      </h2>
      <p className="text-sm text-muted mb-6">
        От материала зависит прочность, внешний вид и цена изделия
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {materials.map((mat) => {
          const info = MATERIAL_INFO[mat.name]
          const isSelected = mat.available && selected === mat.name

          return (
            <div
              key={mat.id}
              role="button"
              tabIndex={mat.available ? 0 : -1}
              aria-disabled={!mat.available}
              onClick={() => {
                if (!mat.available) return
                setValue("material", mat.name as OrderFormData["material"], { shouldValidate: true })
                setValue("color", "")
              }}
              onKeyDown={(e) => {
                if (!mat.available) return
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setValue("material", mat.name as OrderFormData["material"], { shouldValidate: true })
                  setValue("color", "")
                }
              }}
              className={cn(
                "text-left p-4 rounded-xl border-2 transition-all relative select-none",
                !mat.available && "opacity-60 cursor-not-allowed",
                mat.available && isSelected
                  ? "border-accent bg-(--accent-subtle)"
                  : mat.available
                  ? "border-border bg-surface hover:border-(--accent-border) cursor-pointer"
                  : "border-border bg-surface",
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: mat.color, boxShadow: `0 0 8px ${mat.color}66` }}
                />
                <span
                  className="font-black text-lg text-foreground font-display"
                >
                  {mat.name}
                </span>
                <div className="ml-auto flex items-center gap-1.5 shrink-0">
                  {info && <MaterialInfo mat={mat} info={info} />}
                  {!mat.available && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-border text-muted">
                      Скоро
                    </span>
                  )}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted mb-2">{mat.description}</p>
              <p className="text-xs font-mono text-muted mb-1">
                Лучше всего для: {mat.best}
              </p>
              <p className="text-sm font-mono font-semibold text-accent">{mat.price}</p>
            </div>
          )
        })}
      </div>

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
  const [open, setOpen] = useState(false)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setOpen((v) => !v)
          }}
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center",
            "text-[10px] font-bold font-mono leading-none",
            "border transition-colors duration-150 z-10",
            open
              ? "bg-accent border-accent text-white"
              : "bg-background border-border text-muted hover:border-accent hover:text-accent",
          )}
          aria-label={`Подробнее о ${mat.name}`}
        >
          ?
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="top"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "z-50 w-64 rounded-xl border border-border bg-surface-raised shadow-xl",
            "p-4 text-sm",
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: mat.color }}
            />
            <div>
              <p className="font-bold text-foreground font-display">
                {mat.name}
              </p>
              <p className="text-[11px] text-muted font-mono">{info.full}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg bg-background px-3 py-2">
              <p className="text-[10px] text-muted font-mono uppercase tracking-wide mb-0.5">
                Темп.
              </p>
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

          <Popover.Arrow className="fill-border" width={12} height={6} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
