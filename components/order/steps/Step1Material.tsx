"use client"

import { useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import type { OrderFormData } from "@/lib/validations/order"
import type { MaterialWithColors } from "@/actions/materials"

interface Props {
  materials: MaterialWithColors[]
}

export function Step1Material({ materials }: Props) {
  const { watch, setValue, formState: { errors } } = useFormContext<OrderFormData>()
  const selected = watch("material")

  return (
    <div>
      <h2 className="text-2xl font-black text-[var(--foreground)] mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        Выберите материал
      </h2>
      <p className="text-sm text-[var(--muted)] mb-6">От материала зависит прочность, внешний вид и цена изделия</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {materials.map((mat) => (
          <button
            key={mat.id}
            type="button"
            disabled={!mat.available}
            onClick={() => {
              setValue("material", mat.name as OrderFormData["material"], { shouldValidate: true })
              setValue("color", "")
            }}
            className={cn(
              "text-left p-4 rounded-xl border-2 transition-all relative",
              !mat.available && "opacity-60 cursor-not-allowed",
              mat.available && selected === mat.name
                ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
                : mat.available
                ? "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border)]"
                : "border-[var(--border)] bg-[var(--surface)]",
            )}
          >
            {!mat.available && (
              <span className="absolute top-2 right-2 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[var(--border)] text-[var(--muted)]">
                Скоро
              </span>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: mat.color, boxShadow: `0 0 8px ${mat.color}66` }}
              />
              <span className="font-black text-lg text-[var(--foreground)]" style={{ fontFamily: "Syne, sans-serif" }}>
                {mat.name}
              </span>
              {mat.available && selected === mat.name && (
                <div className="ml-auto w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                  <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm text-[var(--muted)] mb-2">{mat.description}</p>
            <p className="text-xs font-mono text-[var(--muted)] mb-1">Лучше всего для: {mat.best}</p>
            <p className="text-sm font-mono font-semibold text-[var(--accent)]">{mat.price}</p>
          </button>
        ))}
      </div>

      {errors.material && (
        <p className="mt-3 text-sm text-[var(--error)]">{errors.material.message}</p>
      )}
    </div>
  )
}
