'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import {
  useState,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

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

interface ChooserProps {
  open: boolean
  onOpenChange: (value: boolean) => void
  onSelect?: () => void
}

function Chooser({ open, onOpenChange, onSelect }: ChooserProps) {
  function handlePick() {
    onOpenChange(false)
    onSelect?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Что нужно сделать?</DialogTitle>
          <DialogDescription>
            Выберите услугу — рассчитаем стоимость и сроки.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 mt-2">
          {OPTIONS.map(({ title, hint, href, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={handlePick}
              className="group flex items-start gap-3 p-4 rounded-xl border border-border hover:border-(--accent-border) hover:bg-(--accent-subtle) transition-all"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-(--accent-subtle) text-accent shrink-0">
                <Icon className="size-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">{hint}</p>
              </div>
              <ArrowRight className="size-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 mt-2.5" />
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
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
