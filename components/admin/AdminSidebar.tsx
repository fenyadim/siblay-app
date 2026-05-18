'use client'

import { LogOut, MoveUpRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Дашборд', icon: '⬡' },
  { href: '/admin/orders', label: 'Заказы', icon: '◫' },
  { href: '/admin/quotes', label: 'Заявки', icon: '✎' },
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
    <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col min-h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link href="/admin" aria-label="Siblay Admin">
          <Logo className="text-sm" markClassName="h-5" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-(--accent-subtle) text-accent'
                  : 'text-muted hover:text-foreground hover:bg-background'
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-border pt-3">
        <Button variant="ghost" className="w-full text-muted" asChild>
          <Link href="/">
            <MoveUpRight /> На сайт
          </Link>
        </Button>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-destructive hover:bg-background transition-colors"
        >
          <LogOut /> Выйти
        </Button>
      </div>
    </aside>
  )
}
