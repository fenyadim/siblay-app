'use client'

import { MapPin, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'

import { OrderCtaButton } from '@/components/order-cta/OrderCtaDialog'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useScroll } from '@/hooks/use-scroll'
import { business } from '@/lib/seo'

import { ThemeToggle } from './ThemeToggle'

const links = [
  { href: '/#services', label: 'Услуги' },
  { href: '/#how-it-works', label: 'Как мы работаем' },
  { href: '/portfolio', label: 'Портфолио' },
  { href: '/contacts', label: 'Контакты' },
]

function NavLink({
  pathname,
  href,
  ...props
}: ComponentProps<'a'> & { href: string; pathname: string }) {
  if (pathname === '/' && href.startsWith('/#')) {
    return <a href={href} {...props} />
  }
  return <Link href={href} aria-current={pathname === href ? 'page' : undefined} {...props} />
}

export function Header() {
  const pathname = usePathname()
  const compact = useScroll(16)
  return (
    <header className="studio-header" data-compact={compact}>
      <div className="studio-header-bar flex items-center justify-between gap-1 sm:gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Siblay — на главную">
            <Logo className="text-lg sm:text-xl" markClassName="h-6 sm:h-7" />
          </Link>
          <Link
            href="/contacts"
            className="hidden items-center gap-1.5 border-l border-border pl-3 text-sm text-muted hover:text-foreground xl:flex"
          >
            <MapPin size={15} aria-hidden="true" />
            {business.address.city}
          </Link>
        </div>

        <nav aria-label="Основная навигация" className="hidden items-center gap-0.5 lg:flex">
          {links.map(({ href, label }) => (
            <NavLink
              key={href}
              href={href}
              pathname={pathname}
              className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-(--accent-subtle) hover:text-accent aria-[current=page]:text-accent"
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <OrderCtaButton className="h-9 rounded-full bg-accent px-3 text-accent-foreground hover:bg-(--accent-hover) sm:px-4">
            <span className="sm:hidden">Заказать</span>
            <span className="hidden sm:inline">Оформить заказ</span>
          </OrderCtaButton>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full lg:hidden"
                aria-label="Открыть меню"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              showCloseButton={false}
              aria-describedby={undefined}
              className="gap-6 p-5"
            >
              <div className="flex items-center justify-between">
                <SheetTitle>Навигация</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Закрыть меню">
                    <X />
                  </Button>
                </SheetClose>
              </div>
              <nav aria-label="Мобильная навигация" className="flex flex-col">
                {links.map(({ href, label }) => (
                  <SheetClose asChild key={href}>
                    <NavLink
                      href={href}
                      pathname={pathname}
                      className="border-t border-border py-4 font-display text-2xl font-bold hover:text-accent"
                    >
                      {label}
                    </NavLink>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
