"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { OrderFormData } from "@/lib/validations/order"

const DELIVERY_OPTIONS = [
  { value: "pickup", label: "Самовывоз", icon: "🏪" },
  { value: "courier", label: "Курьер по городу", icon: "🛵" },
  { value: "sdek", label: "Доставка СДЭК", icon: "📦" },
  { value: "pochta", label: "Почта России", icon: "✉️" },
]

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label className="text-sm font-medium text-foreground mb-1.5 block">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

const inputClass = "bg-background border-border text-foreground focus-visible:ring-0 focus-visible:border-accent transition-colors"

export function Step6Contacts() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<OrderFormData>()
  const delivery = watch("delivery")

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-foreground mb-1 font-display">
          Контактные данные
        </h2>
        <p className="text-sm text-muted">Для связи и доставки готового заказа</p>
      </div>

      <div className="space-y-4">
        <Field label="ФИО" required error={errors.fullName?.message}>
          <Input
            {...register("fullName")}
            placeholder="Иванов Иван Иванович"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Телефон" required error={errors.phone?.message}>
            <Input
              {...register("phone")}
              placeholder="+7 (999) 123-45-67"
              type="tel"
              className={inputClass}
            />
          </Field>
          <Field label="Email" required error={errors.email?.message}>
            <Input
              {...register("email")}
              placeholder="ivan@example.ru"
              type="email"
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Delivery */}
      <div>
        <p className="label-mono mb-3">Способ доставки <span className="text-destructive">*</span></p>
        <div className="grid grid-cols-2 gap-2">
          {DELIVERY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("delivery", opt.value as OrderFormData["delivery"], { shouldValidate: true })}
              className={cn(
                "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-150",
                delivery === opt.value
                  ? "border-accent bg-(--accent-subtle)"
                  : "border-border bg-background hover:border-(--accent-border)",
              )}
            >
              <span className="text-xl leading-none">{opt.icon}</span>
              <span className={cn(
                "text-sm font-medium",
                delivery === opt.value ? "text-accent" : "text-foreground",
              )}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
        {errors.delivery && <p className="text-xs text-destructive mt-2">{errors.delivery.message}</p>}
      </div>

      {/* Address */}
      {delivery && delivery !== "pickup" && (
        <Field label="Адрес доставки" required error={errors.address?.message}>
          <Textarea
            {...register("address")}
            placeholder="Город, улица, дом, квартира / индекс (для Почты России)"
            rows={3}
            className={cn(inputClass, "resize-none placeholder:text-(--placeholder)")}
          />
        </Field>
      )}
    </div>
  )
}
