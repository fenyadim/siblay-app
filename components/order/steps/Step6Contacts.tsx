"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OrderFormData } from "@/lib/validations/order"

const DELIVERY_OPTIONS = [
  { value: "pickup", label: "Самовывоз" },
  { value: "courier", label: "Курьер по городу" },
  { value: "sdek", label: "Доставка СДЭК" },
  { value: "pochta", label: "Почта России" },
]

export function Step6Contacts() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<OrderFormData>()
  const delivery = watch("delivery")

  return (
    <div>
      <h2 className="text-2xl font-black text-[var(--foreground)] mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        Контактные данные
      </h2>
      <p className="text-sm text-[var(--muted)] mb-6">Для связи и доставки готового заказа</p>

      <div className="space-y-4">
        {/* Full name */}
        <div>
          <Label className="text-sm text-[var(--muted)] mb-1.5 block">ФИО <span className="text-[var(--error)]">*</span></Label>
          <Input
            {...register("fullName")}
            placeholder="Иванов Иван Иванович"
            className="bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] focus:border-[var(--accent)]"
          />
          {errors.fullName && <p className="text-xs text-[var(--error)] mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-[var(--muted)] mb-1.5 block">Телефон <span className="text-[var(--error)]">*</span></Label>
            <Input
              {...register("phone")}
              placeholder="+7 (999) 123-45-67"
              type="tel"
              className="bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] focus:border-[var(--accent)]"
            />
            {errors.phone && <p className="text-xs text-[var(--error)] mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <Label className="text-sm text-[var(--muted)] mb-1.5 block">Email <span className="text-[var(--error)]">*</span></Label>
            <Input
              {...register("email")}
              placeholder="ivan@example.ru"
              type="email"
              className="bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] focus:border-[var(--accent)]"
            />
            {errors.email && <p className="text-xs text-[var(--error)] mt-1">{errors.email.message}</p>}
          </div>
        </div>

        {/* Delivery */}
        <div>
          <Label className="text-sm text-[var(--muted)] mb-1.5 block">Способ доставки <span className="text-[var(--error)]">*</span></Label>
          <Select
            value={delivery}
            onValueChange={(v) => setValue("delivery", v as OrderFormData["delivery"], { shouldValidate: true })}
          >
            <SelectTrigger className="bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)]">
              <SelectValue placeholder="Выберите способ доставки" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--surface)] border-[var(--border)]">
              {DELIVERY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="text-[var(--foreground)]">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.delivery && <p className="text-xs text-[var(--error)] mt-1">{errors.delivery.message}</p>}
        </div>

        {/* Address (if not pickup) */}
        {delivery && delivery !== "pickup" && (
          <div>
            <Label className="text-sm text-[var(--muted)] mb-1.5 block">Адрес доставки <span className="text-[var(--error)]">*</span></Label>
            <Textarea
              {...register("address")}
              placeholder="Город, улица, дом, квартира / индекс (для Почты России)"
              rows={3}
              className="bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--placeholder)] focus:border-[var(--accent)] resize-none"
            />
            {errors.address && <p className="text-xs text-[var(--error)] mt-1">{errors.address.message}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
