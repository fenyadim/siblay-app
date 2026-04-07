'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Resolver } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import type { MaterialWithColors } from '@/actions/materials'
import { createOrder } from '@/actions/orders'
import { OrderStepper } from '@/components/order/OrderStepper'
import { Step1Material } from '@/components/order/steps/Step1Material'
import { Step2Color } from '@/components/order/steps/Step2Color'
import { Step3Params } from '@/components/order/steps/Step3Params'
import { Step4Files } from '@/components/order/steps/Step4Files'
import { Step5Comment } from '@/components/order/steps/Step5Comment'
import { Step6Contacts } from '@/components/order/steps/Step6Contacts'
import { SummaryPanel } from '@/components/order/SummaryPanel'
import { Button } from '@/components/ui/button'
import {
  fullOrderSchema,
  type OrderFormData,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
} from '@/lib/validations/order'

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
    defaultValues: { quantity: 1, infill: 50, hasModel: true, files: [] },
    mode: 'onBlur',
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
    const result = schema.safeParse(methods.getValues())
    if (!result.success) {
      result.error.issues.forEach((e) => {
        methods.setError(e.path[0] as keyof OrderFormData, { message: e.message })
      })
      return
    }
    setStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const result = await createOrder(methods.getValues())
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Заказ отправлен! Свяжемся с вами в течение 2 часов.')
        router.push(`/?order=${result.orderId}`)
      }
    } catch {
      toast.error('Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <span className="label-mono">Оформление заказа</span>
          <h1
            className="mt-2 text-4xl font-black tracking-tight text-foreground font-display"
          >
            Новый заказ
          </h1>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          <FormProvider {...methods}>
            {/* Main card */}
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              {/* Stepper header */}
              <div className="px-6 lg:px-8 pt-6 pb-5 border-b border-border bg-surface-raised">
                <OrderStepper current={step} />
              </div>

              {/* Step content */}
              <div className="px-6 lg:px-8 py-8">{STEP_COMPONENTS[step - 1]}</div>

              {/* Navigation footer */}
              <div className="px-6 lg:px-8 py-5 border-t border-border bg-surface-raised flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep((s) => s - 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={step === 1}
                >
                  <ArrowLeft className="size-3.5" />
                  Назад
                </Button>

                {/* Step dots (mobile) */}
                <div className="sm:hidden flex gap-1">
                  {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i + 1 === step ? 16 : 6,
                        height: 6,
                        background: i + 1 <= step ? 'var(--accent)' : 'var(--border)',
                      }}
                    />
                  ))}
                </div>

                {step < TOTAL_STEPS ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #7c3aed)' }}
                  >
                    Далее
                    <ArrowRight className="size-3.5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="rounded-xl px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #7c3aed)' }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        Отправить заказ
                        <Check className="size-3.5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Summary sidebar */}
            <SummaryPanel />
          </FormProvider>
        </div>
      </div>
    </div>
  )
}
