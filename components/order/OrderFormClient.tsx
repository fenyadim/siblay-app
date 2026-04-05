"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Resolver } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { OrderStepper } from "@/components/order/OrderStepper"
import { SummaryPanel } from "@/components/order/SummaryPanel"
import { Step1Material } from "@/components/order/steps/Step1Material"
import { Step2Color } from "@/components/order/steps/Step2Color"
import { Step3Params } from "@/components/order/steps/Step3Params"
import { Step4Files } from "@/components/order/steps/Step4Files"
import { Step5Comment } from "@/components/order/steps/Step5Comment"
import { Step6Contacts } from "@/components/order/steps/Step6Contacts"
import { Button } from "@/components/ui/button"

import {
  fullOrderSchema,
  step1Schema, step2Schema, step3Schema,
  step4Schema, step5Schema, step6Schema,
  type OrderFormData,
} from "@/lib/validations/order"
import { createOrder } from "@/actions/orders"
import type { MaterialWithColors } from "@/actions/materials"

const TOTAL_STEPS = 6
const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, step6Schema]

interface Props {
  materials: MaterialWithColors[]
}

export function OrderFormClient({ materials }: Props) {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const methods = useForm<OrderFormData>({
    resolver: zodResolver(fullOrderSchema) as Resolver<OrderFormData>,
    defaultValues: {
      quantity: 1,
      infill: 50,
      hasModel: true,
      files: [],
    },
    mode: "onBlur",
  })

  const STEP_COMPONENTS = [
    <Step1Material key={1} materials={materials} />,
    <Step2Color key={2} materials={materials} />,
    <Step3Params key={3} />,
    <Step4Files key={4} />,
    <Step5Comment key={5} />,
    <Step6Contacts key={6} />,
  ]

  async function handleNext() {
    const schema = STEP_SCHEMAS[step - 1]
    const values = methods.getValues()
    const result = schema.safeParse(values)

    if (!result.success) {
      result.error.issues.forEach((e) => {
        const field = e.path[0] as keyof OrderFormData
        methods.setError(field, { message: e.message })
      })
      return
    }

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const values = methods.getValues()
      const result = await createOrder(values)
      if ("error" in result) {
        toast.error(result.error)
      } else {
        toast.success("Заказ отправлен! Свяжемся с вами в течение 2 часов.")
        router.push(`/?order=${result.orderId}`)
      }
    } catch {
      toast.error("Произошла ошибка. Попробуйте ещё раз.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <span className="label-mono">Оформление</span>
          <h1
            className="mt-2 text-4xl font-black tracking-tight text-[var(--foreground)]"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Новый заказ
          </h1>
        </div>

        {/* Stepper */}
        <div className="mb-8 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <OrderStepper current={step} />
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_320px] gap-8">
          <FormProvider {...methods}>
            {/* Step content */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 lg:p-8">
              {STEP_COMPONENTS[step - 1]}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep((s) => s - 1)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  disabled={step === 1}
                  className="border-[var(--border)] text-[var(--foreground)]"
                >
                  ← Назад
                </Button>

                {step < TOTAL_STEPS ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-8"
                  >
                    Далее →
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-8"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Отправка...
                      </span>
                    ) : (
                      "Отправить заказ ✓"
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Summary */}
            <SummaryPanel />
          </FormProvider>
        </div>
      </div>
    </div>
  )
}
