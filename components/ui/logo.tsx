import { cn } from '@/lib/utils'

type LogoMarkProps = React.SVGAttributes<SVGSVGElement>

export function LogoMark({ className, ...props }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn(className)}
      {...props}
    >
      <rect width="512" height="512" rx="112" fill="currentColor" />
      <g transform="translate(96 112) scale(4)">
        <g fill="var(--background)">
          <path d="M 6 16 Q 24 6 42 16 Q 60 26 76 18 L 76 25 Q 60 33 42 23 Q 24 13 6 23 Z" />
          <path d="M 6 36 Q 24 26 42 36 Q 60 46 76 38 L 76 45 Q 60 53 42 43 Q 24 33 6 43 Z" />
          <path d="M 6 56 Q 24 46 42 56 Q 60 66 76 58 L 76 65 Q 60 73 42 63 Q 24 53 6 63 Z" />
        </g>
        <circle cx="76" cy="18" r="4" fill="var(--accent)" />
      </g>
    </svg>
  )
}

type LogoProps = {
  className?: string
  markClassName?: string
  wordmarkClassName?: string
  showWordmark?: boolean
}

export function Logo({
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
}: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 leading-none', className)}>
      <LogoMark className={cn('aspect-square h-[1.6em] w-auto text-foreground', markClassName)} />
      {showWordmark && (
        <span
          className={cn(
            'font-display font-black italic tracking-tight uppercase text-foreground',
            wordmarkClassName
          )}
        >
          Siblay<span className="text-accent">.</span>
        </span>
      )}
    </span>
  )
}
