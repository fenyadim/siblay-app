'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Loader2, Paperclip, X } from 'lucide-react'
import Link from 'next/link'
import { type ComponentProps, type ReactNode, useId, useRef, useState } from 'react'
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
import { INQUIRY_FILE_ACCEPT, inquiryFileError, MAX_INQUIRY_FILES } from '@/lib/inquiry-files'
import { cn, formatFileSize } from '@/lib/utils'
import { type InquiryFile, type InquiryFormData, inquirySchema } from '@/lib/validations/inquiry'

const inputClass =
  'bg-background border-border text-foreground focus-visible:ring-0 focus-visible:border-accent transition-colors'

interface OrderDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  onSelect?: () => void
}

function OrderDialog({ open, onOpenChange, onSelect }: OrderDialogProps) {
  const [busy, setBusy] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) onOpenChange(value)
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg" showCloseButton={!busy}>
        <InquiryForm
          onBusyChange={setBusy}
          onDone={() => {
            onOpenChange(false)
            onSelect?.()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

function Field({
  id,
  label,
  required,
  error,
  children,
  hint,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-medium text-foreground mb-1.5 block">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted mt-1">{hint}</p>}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

function InquiryForm({
  onDone,
  onBusyChange,
}: {
  onDone: () => void
  onBusyChange: (busy: boolean) => void
}) {
  const id = useId()
  const [files, setFiles] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [progress, setProgress] = useState('')
  const uploadedFiles = useRef(new Map<File, InquiryFile>())
  const submittingRef = useRef(false)

  function addFiles(selected: File[]) {
    if (submittingRef.current) return
    const next = [...files]
    const errors: string[] = []
    for (const file of selected) {
      const error = inquiryFileError(file)
      if (error) {
        errors.push(file.name + ': ' + error)
      } else if (next.length >= MAX_INQUIRY_FILES) {
        errors.push('Можно прикрепить максимум ' + MAX_INQUIRY_FILES + ' файлов')
        break
      } else {
        next.push(file)
      }
    }
    setFiles(next)
    setFileErrors(errors)
  }
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
      files: [],
      personalDataConsent: false,
    },
    mode: 'onBlur',
  })

  async function submit(values: InquiryFormData) {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    onBusyChange(true)
    try {
      const attachments: InquiryFile[] = []
      for (const [index, file] of files.entries()) {
        setProgress('Загрузка файла ' + (index + 1) + ' из ' + files.length + '...')
        let uploaded = uploadedFiles.current.get(file)
        if (!uploaded) {
          const body = new FormData()
          body.append('file', file)
          body.append('folder', 'orders')
          const response = await fetch('/api/upload', { method: 'POST', body })
          const data = await response.json()
          if (!response.ok || typeof data.fileUrl !== 'string') {
            throw new Error(file.name + ': ' + (data.error || 'Ошибка загрузки файла'))
          }
          uploaded = {
            fileName: file.name,
            fileUrl: data.fileUrl,
            fileType: file.type,
            fileSize: file.size,
          }
          uploadedFiles.current.set(file, uploaded)
        }
        attachments.push(uploaded)
      }
      setProgress('Отправка заявки...')
      const result = await createInquiry({ ...values, files: attachments })
      if ('error' in result) {
        toast.error(result.error)
        return
      }

      toast.success('Заявка отправлена! Мы свяжемся с вами, чтобы согласовать стоимость и сроки.')
      reset()
      setFiles([])
      uploadedFiles.current.clear()
      onDone()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка. Попробуйте ещё раз.')
    } finally {
      submittingRef.current = false
      setSubmitting(false)
      onBusyChange(false)
      setProgress('')
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-display">Оформить заказ</DialogTitle>
        <DialogDescription>
          Оставьте контакты и опишите заказ. Если есть фото или 3D-модель, прикрепите их — мы
          согласуем стоимость и сроки.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(submit)} className="mt-2" aria-busy={submitting}>
        <fieldset disabled={submitting} className="min-w-0 space-y-4">
          <Field id={id + '-fullName'} label="ФИО" required error={errors.fullName?.message}>
            <Input
              {...register('fullName')}
              id={id + '-fullName'}
              autoComplete="name"
              placeholder="Иванов Иван Иванович"
              className={inputClass}
              aria-invalid={Boolean(errors.fullName)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id={id + '-phone'} label="Телефон" required error={errors.phone?.message}>
              <Input
                {...register('phone')}
                id={id + '-phone'}
                autoComplete="tel"
                placeholder="+7 (999) 123-45-67"
                type="tel"
                className={inputClass}
                aria-invalid={Boolean(errors.phone)}
              />
            </Field>
            <Field id={id + '-email'} label="Email" required error={errors.email?.message}>
              <Input
                {...register('email')}
                id={id + '-email'}
                autoComplete="email"
                placeholder="ivan@example.ru"
                type="email"
                className={inputClass}
                aria-invalid={Boolean(errors.email)}
              />
            </Field>
          </div>

          <Field
            id={id + '-telegram'}
            label="Telegram"
            error={(errors.telegram as { message?: string } | undefined)?.message}
            hint="Необязательно — добавьте, если так удобнее держать связь."
          >
            <Input
              {...register('telegram')}
              id={id + '-telegram'}
              placeholder="@username или ссылка t.me/..."
              className={inputClass}
              autoComplete="off"
              aria-invalid={Boolean(errors.telegram)}
            />
          </Field>

          <Field
            id={id + '-description'}
            label="Описание заказа"
            required
            error={errors.description?.message}
            hint="Что нужно получить, какие есть исходные данные, примерные размеры, материал или назначение."
          >
            <Textarea
              {...register('description')}
              id={id + '-description'}
              rows={5}
              placeholder="Например: нужна замена сломанной детали, примерно 5 × 3 см, 2 штуки. Будет использоваться на улице."
              className={cn(inputClass, 'resize-none placeholder:text-(--placeholder)')}
              aria-invalid={Boolean(errors.description)}
            />
          </Field>

          <div>
            <Label htmlFor={id + '-files'} className="mb-1.5 block text-sm font-medium">
              Фото или 3D-модель <span className="font-normal text-muted">(необязательно)</span>
            </Label>
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                addFiles(Array.from(event.dataTransfer.files))
              }}
              className="rounded-xl border border-dashed border-border bg-surface p-4"
            >
              <div className="mb-3 flex items-center gap-2 text-sm text-muted">
                <Paperclip className="size-4 shrink-0" />
                Выберите файлы или перетащите их сюда
              </div>
              <Input
                id={id + '-files'}
                type="file"
                accept={INQUIRY_FILE_ACCEPT}
                multiple
                aria-describedby={id + '-files-hint'}
                className={cn(inputClass, 'min-w-0')}
                onChange={(event) => {
                  addFiles(Array.from(event.target.files ?? []))
                  event.target.value = ''
                }}
              />
              <p id={id + '-files-hint'} className="mt-2 text-xs leading-relaxed text-muted">
                Фото: JPG, PNG, WEBP, HEIC — до 20 МБ. Модели: .stp, .stl — до 100 МБ. Всего до 10
                файлов. Можно отправить заказ без вложений.
              </p>
            </div>
            {files.length > 0 && (
              <ul className="mt-2 space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-border p-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={'Удалить ' + file.name}
                      onClick={() => {
                        setFiles((current) => current.filter((_, i) => i !== index))
                        setFileErrors([])
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {fileErrors.length > 0 && (
              <div role="alert" className="mt-2 space-y-1 text-xs text-destructive">
                {fileErrors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </div>

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
                {progress || 'Отправка...'}
              </>
            ) : (
              <>
                Отправить заявку
                <Check className="size-3.5" />
              </>
            )}
          </Button>
        </fieldset>
        <p role="status" className="sr-only">
          {progress}
        </p>
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
      <OrderDialog open={open} onOpenChange={setOpen} onSelect={onSelect} />
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
      <OrderDialog open={open} onOpenChange={setOpen} onSelect={onSelect} />
    </>
  )
}
