'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import type { Resolver } from 'react-hook-form'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MAX_MODEL_SIZE, MAX_QUOTE_FILES, selectAttachments } from '@/lib/attachments'
import { submitRequest } from '@/lib/submit-request'
import { cn, formatFileSize } from '@/lib/utils'
import {
  DESIRED_FORMATS,
  MODELING_SOURCES,
  QUOTE_TYPES,
  SCAN_LOCATIONS,
  quoteSchema,
  type QuoteFormData,
} from '@/lib/validations/quote'

type QuoteType = (typeof QUOTE_TYPES)[number]

const SERVICE_OPTIONS: Array<{
  value: QuoteType
  title: string
  description: string
  icon: string
}> = [
  {
    value: 'MODELING',
    title: '3D-моделирование',
    description: 'По эскизу, фото или чертежу — от детали до сложной формы.',
    icon: '✎',
  },
  {
    value: 'SCANNING',
    title: '3D-сканирование',
    description: 'Цифровая копия физического объекта. Опционально — реверс-инжиниринг.',
    icon: '◎',
  },
]

const SOURCE_OPTIONS: Array<{ value: (typeof MODELING_SOURCES)[number]; label: string }> = [
  { value: 'sketch', label: 'По эскизу / описанию' },
  { value: 'photo', label: 'По фотографиям' },
  { value: 'drawing', label: 'По чертежу (CAD/CAM)' },
  { value: 'revise', label: 'Доработка существующей модели' },
]

const LOCATION_OPTIONS: Array<{
  value: (typeof SCAN_LOCATIONS)[number]
  label: string
  icon: string
}> = [
  { value: 'pickup', label: 'Заберём у клиента', icon: '🚚' },
  { value: 'bring', label: 'Привезу сам', icon: '🏪' },
  { value: 'onsite', label: 'Выезд специалиста', icon: '📍' },
]

const FORMAT_OPTIONS: Array<{ value: (typeof DESIRED_FORMATS)[number]; label: string }> = [
  { value: 'STL', label: 'STL' },
  { value: 'OBJ', label: 'OBJ' },
  { value: 'STEP', label: 'STEP' },
  { value: '3MF', label: '3MF' },
  { value: 'PARAMETRIC', label: 'Параметрический CAD' },
  { value: 'OTHER', label: 'Другой / уточню' },
]

const ACCEPTED_FORMATS = [
  '.stl',
  '.obj',
  '.3mf',
  '.step',
  '.stp',
  '.jpg',
  '.jpeg',
  '.png',
  '.heic',
  '.webp',
].join(',')

interface Props {
  initialType: QuoteType
}

const inputClass =
  'bg-background border-border text-foreground focus-visible:ring-0 focus-visible:border-accent transition-colors'

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
  children: React.ReactNode
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

export function QuoteFormClient({ initialType }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const methods = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema) as Resolver<QuoteFormData>,
    defaultValues: {
      type: initialType,
      description: '',
      desiredFormat: 'STL',
      sourceType: initialType === 'MODELING' ? 'sketch' : undefined,
      location: initialType === 'SCANNING' ? 'bring' : undefined,
      needsReverse: false,
      files: [],
      fullName: '',
      phone: '',
      email: '',
      telegram: '',
      personalDataConsent: false,
    },
    mode: 'onBlur',
  })

  async function handleSubmit(data: QuoteFormData) {
    if (submitting) return
    setSubmitting(true)
    try {
      const result = await submitRequest('quote', data)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Заявка отправлена! Менеджер свяжется в течение 2 часов.')
        router.push(`/?quote=${result.id}`)
      }
    } catch {
      toast.error('Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-32 lg:pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="studio-heading">
            Оставить заявку
          </h1>
          <p className="text-sm text-muted mt-2 max-w-xl">
            Расскажите о задаче — менеджер рассчитает стоимость и сроки и свяжется в течение 2 часов
            в рабочее время.
          </p>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(handleSubmit)}
            className="rounded-2xl border border-border bg-surface p-6 lg:p-8 space-y-8"
          >
            <ServiceTypeSection />
            <ServiceDetailsSection />
            <FilesSection disabled={submitting} />
            <ContactsSection />

            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto rounded-xl px-8 py-3 bg-accent text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
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
        </FormProvider>
      </div>
    </div>
  )
}

function ServiceTypeSection() {
  const { watch, setValue } = useFormContext<QuoteFormData>()
  const type = watch('type')

  function selectType(value: QuoteType) {
    setValue('type', value, { shouldValidate: true })
    // Сбрасываем поля, не относящиеся к новому типу, чтобы не оставлять «мусор» в форме.
    if (value === 'MODELING') {
      setValue('sourceType', 'sketch')
      setValue('location', undefined)
      setValue('objectWidth', undefined)
      setValue('objectHeight', undefined)
      setValue('objectLength', undefined)
      setValue('needsReverse', false)
    } else {
      setValue('location', 'bring')
      setValue('sourceType', undefined)
    }
  }

  return (
    <section>
      <p className="label-mono mb-3">Тип услуги</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => selectType(opt.value)}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-150',
              type === opt.value
                ? 'border-accent bg-(--accent-subtle)'
                : 'border-border bg-background hover:border-(--accent-border)',
            )}
          >
            <span className="text-2xl leading-none mt-0.5 text-accent">{opt.icon}</span>
            <div>
              <p
                className={cn(
                  'text-base font-semibold',
                  type === opt.value ? 'text-accent' : 'text-foreground',
                )}
              >
                {opt.title}
              </p>
              <p className="text-xs text-muted mt-1 leading-relaxed">{opt.description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function ServiceDetailsSection() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<QuoteFormData>()

  const type = watch('type')
  const sourceType = watch('sourceType')
  const location = watch('location')
  const desiredFormat = watch('desiredFormat')
  const needsReverse = watch('needsReverse')

  return (
    <section className="space-y-6">
      <p className="label-mono">Детали</p>

      {type === 'MODELING' && (
        <Field
          label="Тип исходника"
          required
          error={(errors.sourceType as { message?: string })?.message}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SOURCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setValue('sourceType', opt.value, { shouldValidate: true })
                }
                className={cn(
                  'p-3 rounded-xl border text-left text-sm font-medium transition-all',
                  sourceType === opt.value
                    ? 'border-accent bg-(--accent-subtle) text-accent'
                    : 'border-border bg-background text-foreground hover:border-(--accent-border)',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>
      )}

      {type === 'SCANNING' && (
        <>
          <Field
            label="Примерные габариты объекта (мм)"
            hint="Длина × ширина × высота. Подскажет менеджеру с типом сканера и сроком."
          >
            <div className="grid grid-cols-3 gap-2">
              <Input
                {...register('objectLength')}
                placeholder="Длина"
                type="number"
                inputMode="numeric"
                min="1"
                max="10000"
                className={inputClass}
              />
              <Input
                {...register('objectWidth')}
                placeholder="Ширина"
                type="number"
                inputMode="numeric"
                min="1"
                max="10000"
                className={inputClass}
              />
              <Input
                {...register('objectHeight')}
                placeholder="Высота"
                type="number"
                inputMode="numeric"
                min="1"
                max="10000"
                className={inputClass}
              />
            </div>
          </Field>

          <Field
            label="Где находится объект"
            required
            error={(errors.location as { message?: string })?.message}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {LOCATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setValue('location', opt.value, { shouldValidate: true })
                  }
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all',
                    location === opt.value
                      ? 'border-accent bg-(--accent-subtle) text-accent'
                      : 'border-border bg-background text-foreground hover:border-(--accent-border)',
                  )}
                >
                  <span className="text-base">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface-raised cursor-pointer">
            <input
              type="checkbox"
              checked={needsReverse ?? false}
              onChange={(e) => setValue('needsReverse', e.target.checked)}
              className="mt-0.5 size-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-foreground leading-relaxed">
              <span className="font-medium">+ Реверс-инжиниринг</span>
              <span className="block text-xs text-muted mt-0.5">
                Помимо скан-меша получить параметрический CAD-файл для дальнейшей правки.
              </span>
            </span>
          </label>
        </>
      )}

      <Field label="Желаемый формат результата">
        <div className="flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue('desiredFormat', opt.value)}
              className={cn(
                'px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all',
                desiredFormat === opt.value
                  ? 'border-accent bg-(--accent-subtle) text-accent'
                  : 'border-border bg-background text-foreground hover:border-(--accent-border)',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="Опишите задачу"
        required
        error={errors.description?.message}
        hint={
          type === 'MODELING'
            ? 'Что нужно смоделировать, габариты, точность, важные особенности.'
            : 'Что сканируем, материал, хрупкость, точность, важные участки.'
        }
      >
        <Textarea
          {...register('description')}
          rows={5}
          placeholder={
            type === 'MODELING'
              ? 'Например: корпус устройства 120×60×40 мм с креплениями M3, по приложенному эскизу.'
              : 'Например: корпус двигателя 30×25×20 см, нужна точность для подгонки крышки.'
          }
          className={cn(inputClass, 'resize-none placeholder:text-(--placeholder)')}
        />
      </Field>
    </section>
  )
}

function FilesSection({ disabled }: { disabled: boolean }) {
  const { setValue, getValues, watch } = useFormContext<QuoteFormData>()
  const files = watch('files') ?? []
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(selected: FileList) {
    if (disabled) return

    const result = selectAttachments(getValues('files'), selected, MAX_QUOTE_FILES)
    setValue('files', result.files, { shouldValidate: true })
    setFileErrors(result.errors)
  }

  function removeFile(index: number) {
    setValue('files', getValues('files').filter((_, i) => i !== index), { shouldValidate: true })
  }

  return (
    <section>
      <p className="label-mono mb-3">Файлы</p>
      <div
        onDrop={(e) => {
          e.preventDefault()
          addFiles(e.dataTransfer.files)
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors border-border bg-background hover:border-(--accent-border)"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FORMATS}
          disabled={disabled}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <div className="text-2xl mb-2 text-muted">📎</div>
        <p className="text-sm font-medium text-foreground mb-1">
          Перетащите файлы или нажмите
        </p>
        <p className="text-xs text-muted">
          Эскизы, фото, чертежи или 3D-модели · до {formatFileSize(MAX_MODEL_SIZE)} · до {MAX_QUOTE_FILES} файлов
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background"
            >
              <div className="w-8 h-8 rounded-lg bg-(--accent-subtle) flex items-center justify-center text-xs font-mono text-accent shrink-0">
                {f.name.split('.').pop()?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                <p className="text-xs text-muted">{formatFileSize(f.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                disabled={disabled}
                aria-label={`Убрать файл ${f.name}`}
                className="text-muted hover:text-destructive transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {fileErrors.map((e, i) => (
        <p key={i} className="mt-2 text-xs text-destructive">
          {e}
        </p>
      ))}
    </section>
  )
}

function ContactsSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<QuoteFormData>()

  return (
    <section className="space-y-4">
      <p className="label-mono">Контакты</p>

      <Field label="ФИО" required error={errors.fullName?.message}>
        <Input
          {...register('fullName')}
          placeholder="Иванов Иван Иванович"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Телефон" required error={errors.phone?.message}>
          <Input
            {...register('phone')}
            placeholder="+7 (999) 123-45-67"
            type="tel"
            className={inputClass}
          />
        </Field>
        <Field label="Email" required error={errors.email?.message}>
          <Input
            {...register('email')}
            placeholder="ivan@example.ru"
            type="email"
            className={inputClass}
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
        />
      </Field>

      <div className="rounded-xl border border-border bg-surface-raised p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...register('personalDataConsent')}
            type="checkbox"
            className="mt-0.5 size-4 rounded border-border text-accent focus:ring-accent"
          />
          <span className="text-sm text-foreground leading-relaxed">
            Я даю согласие на обработку моих персональных данных в целях рассмотрения заявки,
            а также ознакомлен(а) с{' '}
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
    </section>
  )
}
