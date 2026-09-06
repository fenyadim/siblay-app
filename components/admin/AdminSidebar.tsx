'use client'

import { LogOut, MoveUpRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin/orders', label: 'Заказы', icon: '◫' },
  { href: '/admin/portfolio', label: 'Портфолио', icon: '◈' },
  { href: '/admin/materials', label: 'Материалы', icon: '◉' },
  { href: '/admin/reviews', label: 'Отзывы', icon: '★' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="relative w-full shrink-0 border-b border-border bg-surface flex flex-col lg:w-56 lg:border-b-0 lg:border-r lg:min-h-dvh">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 pr-28 lg:px-5 border-b border-border">
        <Link href="/admin" aria-label="Siblay Admin" className="inline-flex min-h-11 items-center">
          <Logo className="text-sm" markClassName="h-5" />
        </Link>
      </div>

      {/* Nav */}
      <nav
        aria-label="Разделы админки"
        className="grid grid-cols-4 gap-1 p-2 lg:flex lg:flex-1 lg:flex-col lg:px-3 lg:py-4"
      >
        {NAV.map((item) => {
          const active =
            pathname.startsWith(item.href) ||
            (item.href === '/admin/orders' && pathname.startsWith('/admin/quotes'))
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-w-0 min-h-12 flex-col justify-center items-center gap-1 px-1 py-2 rounded-lg text-xs font-medium transition-colors lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-sm',
                active
                  ? 'bg-(--accent-subtle) text-accent'
                  : 'text-muted hover:text-foreground hover:bg-background'
              )}
            >
              <span aria-hidden="true" className="text-base">
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="absolute right-3 top-2 flex gap-1 lg:static lg:block lg:px-3 lg:pb-4 lg:border-t lg:border-border lg:pt-3">
        <Button variant="ghost" className="size-11 p-0 text-muted lg:w-full lg:px-3" asChild>
          <Link href="/" aria-label="На сайт">
            <MoveUpRight /> <span className="hidden lg:inline">На сайт</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          aria-label="Выйти"
          className="size-11 p-0 lg:w-full lg:px-3 flex items-center gap-3 rounded-lg text-sm text-muted hover:text-destructive hover:bg-background transition-colors"
        >
          <LogOut /> <span className="hidden lg:inline">Выйти</span>
        </Button>
      </div>
    </aside>
  )
}
