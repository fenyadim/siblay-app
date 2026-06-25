'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import {
  type ComponentProps,
  type ComponentType,
  type ReactNode,
  type SVGProps,
  useState,
} from 'react'
import type { Resolver } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { createInquiry } from '@/actions/inquiries'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { type InquiryFormData, inquirySchema } from '@/lib/validations/inquiry'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>
type DialogView = 'options' | 'inquiry'

function IconBase({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

// 3D-принтер: рамка с печатающей головкой и слоями детали на платформе.
const Printer3DIcon: IconComponent = (props) => (
  <IconBase {...props}>
    <path d="M4 3h16v5" />
    <path d="M4 3v15" />
    <path d="M20 8v10" />
    <path d="M3 18h18" />
    <rect x="9" y="6" width="6" height="2" rx="0.4" />
    <path d="M12 8v1.5" />
    <path d="M10 13h4" />
    <path d="M9.5 15h5" />
    <path d="M10 17h4" />
  </IconBase>
)

// Изометрический wireframe-куб: классический символ 3D-моделирования.
const Cube3DIcon: IconComponent = (props) => (
  <IconBase {...props}>
    <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7z" />
    <path d="M12 2.5V12" />
    <path d="M3.5 7 12 12l8.5-5" />
    <path d="M12 12v9.5" />
  </IconBase>
)

// Сканер: угловой визир + объёмная фигура в центре.
const Scan3DIcon: IconComponent = (props) => (
  <IconBase {...props}>
    <path d="M3 8V5a2 2 0 0 1 2-2h3" />
    <path d="M16 3h3a2 2 0 0 1 2 2v3" />
    <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
    <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
    <path d="M12 7.5 17 10v4.5L12 17 7 14.5V10z" />
    <path d="M12 7.5V12" />
    <path d="M7 10l5 2 5-2" />
  </IconBase>
)

interface Option {
  title: string
  hint: string
  href: string
  Icon: IconComponent
}

const OPTIONS: Option[] = [
  {
    title: '3D-печать',
    hint: 'Готовая 3D-модель или фото → расчёт стоимости онлайн.',
    href: '/order',
    Icon: Printer3DIcon,
  },
  {
    title: '3D-моделирование',
    hint: 'По эскизу, фото или чертежу — менеджер согласует ТЗ.',
    href: '/quote?service=modeling',
    Icon: Cube3DIcon,
  },
  {
    title: '3D-сканирование',
    hint: 'Цифровая копия физического объекта. + реверс-инжиниринг по запросу.',
    href: '/quote?service=scanning',
    Icon: Scan3DIcon,
  },
]

const optionClass =
  'group flex items-start gap-3 p-4 rounded-xl border border-border hover:border-(--accent-border) hover:bg-(--accent-subtle) transition-all text-left'

const inputClass =
  'bg-background border-border text-foreground focus-visible:ring-0 focus-visible:border-accent transition-colors'

interface ChooserProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  onSelect?: () => void
}

function Chooser({ open, onOpenChange, onSelect }: ChooserProps) {
  const [view, setView] = useState<DialogView>('options')

  function handlePick() {
    onOpenChange(false)
    onSelect?.()
  }

  function handleOpenChange(value: boolean) {
    onOpenChange(value)
    if (!value) setView('options')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {view === 'options' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">Что нужно сделать?</DialogTitle>
              <DialogDescription>Выберите услугу — рассчитаем стоимость и сроки.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 mt-2">
              {OPTIONS.map(({ title, hint, href, Icon }) => (
                <Link key={href} href={href} onClick={handlePick} className={optionClass}>
                  <OptionContent title={title} hint={hint} Icon={Icon} />
                </Link>
              ))}
              <button type="button" onClick={() => setView('inquiry')} className={optionClass}>
                <OptionContent
                  title="Нужна помощь с выбором"
                  hint="Оставьте контакты и описание задачи — подскажем, как лучше оформить заказ."
                  Icon={Mail}
                />
              </button>
            </div>
          </>
        ) : (
          <InquiryForm
            onBack={() => setView('options')}
            onDone={() => {
              setView('options')
              handlePick()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function OptionContent({
  title,
  hint,
  Icon,
}: {
  title: string
  hint: string
  Icon: IconComponent
}) {
  return (
    <>
      <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-(--accent-subtle) text-accent shrink-0">
        <Icon className="size-5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">{hint}</p>
      </div>
      <ArrowRight className="size-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 mt-2.5" />
    </>
  )
}

function Field({
  label,
  required,
  error,
  children,
  hint,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <Label className="text-sm font-medium text-foreground mb-1.5 block">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted mt-1">{hint}</p>}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

function InquiryForm({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema) as Resolver<InquiryFormData>,
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      telegram: '',
      description: '',
      personalDataConsent: false,
    },
    mode: 'onBlur',
  })

  async function submit(values: InquiryFormData) {
    setSubmitting(true)
    try {
      const result = await createInquiry(values)
      if ('error' in result) {
        toast.error(result.error)
        return
      }

      toast.success('Заявка отправлена! Мы свяжемся и подскажем, как лучше оформить заказ.')
      reset()
      onDone()
    } catch {
      toast.error('Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <button
          type="button"
          onClick={onBack}
          className="mb-2 inline-flex w-fit items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Назад
        </button>
        <DialogTitle className="text-2xl font-display">Расскажите о задаче</DialogTitle>
        <DialogDescription>
          Оставьте контакты и короткое описание — мы разберёмся и предложим следующий шаг.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(submit)} className="mt-2 space-y-4">
        <Field label="ФИО" required error={errors.fullName?.message}>
          <Input
            {...register('fullName')}
            placeholder="Иванов Иван Иванович"
            className={inputClass}
            aria-invalid={Boolean(errors.fullName)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Телефон" required error={errors.phone?.message}>
            <Input
              {...register('phone')}
              placeholder="+7 (999) 123-45-67"
              type="tel"
              className={inputClass}
              aria-invalid={Boolean(errors.phone)}
            />
          </Field>
          <Field label="Email" required error={errors.email?.message}>
            <Input
              {...register('email')}
              placeholder="ivan@example.ru"
              type="email"
              className={inputClass}
              aria-invalid={Boolean(errors.email)}
            />
          </Field>
        </div>

        <Field
          label="Telegram"
          error={(errors.telegram as { message?: string } | undefined)?.message}
          hint="Необязательно — добавьте, если так удобнее держать связь."
        >
          <Input
            {...register('telegram')}
            placeholder="@username или ссылка t.me/..."
            className={inputClass}
            autoComplete="off"
            aria-invalid={Boolean(errors.telegram)}
          />
        </Field>

        <Field
          label="Описание заказа"
          required
          error={errors.description?.message}
          hint="Что нужно получить, какие есть исходные данные, примерные размеры, материал или назначение."
        >
          <Textarea
            {...register('description')}
            rows={5}
            placeholder="Например: есть сломанная деталь, хочу понять, можно ли напечатать замену. Фото и размеры могу прислать позже."
            className={cn(inputClass, 'resize-none placeholder:text-(--placeholder)')}
            aria-invalid={Boolean(errors.description)}
          />
        </Field>

        <div className="rounded-xl border border-border bg-surface-raised p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              {...register('personalDataConsent')}
              type="checkbox"
              className="mt-0.5 size-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm leading-relaxed text-foreground">
              Я даю согласие на обработку моих персональных данных в целях рассмотрения заявки, а
              также ознакомлен(а) с{' '}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline-offset-2 hover:underline"
              >
                политикой обработки персональных данных
              </Link>
              .
            </span>
          </label>
          {errors.personalDataConsent && (
            <p className="text-xs text-destructive mt-2">{errors.personalDataConsent.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, var(--accent), #7c3aed)' }}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              Отправить заявку
              <Check className="size-3.5" />
            </>
          )}
        </Button>
      </form>
    </>
  )
}

type ButtonSize = ComponentProps<typeof Button>['size']

interface OrderCtaButtonProps {
  children: ReactNode
  size?: ButtonSize
  className?: string
  onSelect?: () => void
}

export function OrderCtaButton({ children, size, className, onSelect }: OrderCtaButtonProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" size={size} className={className} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <Chooser open={open} onOpenChange={setOpen} onSelect={onSelect} />
    </>
  )
}

interface OrderCtaLinkProps {
  children: ReactNode
  className?: string
  onSelect?: () => void
}

export function OrderCtaLink({ children, className, onSelect }: OrderCtaLinkProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <Chooser open={open} onOpenChange={setOpen} onSelect={onSelect} />
    </>
  )
}
