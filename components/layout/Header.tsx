'use client'

import { MapPin, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { OrderCtaButton } from '@/components/order-cta/OrderCtaDialog'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { business } from '@/lib/seo'

import { ThemeToggle } from './ThemeToggle'

const links = [
  { href: '/#services', label: 'Услуги' },
  { href: '/#how-it-works', label: 'Как мы работаем' },
  { href: '/portfolio', label: 'Портфолио' },
  { href: '/contacts', label: 'Контакты' },
]

export function Header() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="studio-container flex h-16 items-center justify-between gap-1 sm:gap-3 lg:h-18">
        <div className="flex items-center gap-5">
          <Link href="/" aria-label="Siblay — на главную">
            <Logo className="text-xl sm:text-2xl" markClassName="h-7 sm:h-8" />
          </Link>
          <Link
            href="/contacts"
            className="hidden items-center gap-1.5 border-l border-border pl-5 text-sm text-muted hover:text-foreground xl:flex"
          >
            <MapPin size={15} aria-hidden="true" />
            {business.address.city}
          </Link>
        </div>

        <nav aria-label="Основная навигация" className="hidden items-center gap-8 lg:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className="py-2 text-sm font-medium text-foreground hover:text-accent aria-[current=page]:text-accent"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <ThemeToggle />
          <OrderCtaButton className="h-10 rounded-md bg-foreground px-3 text-background hover:bg-foreground/85 sm:px-5">
            <span className="sm:hidden">Заказать</span>
            <span className="hidden sm:inline">Оформить заказ</span>
          </OrderCtaButton>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="lg:hidden" aria-label="Открыть меню">
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
                    <Link
                      href={href}
                      aria-current={pathname === href ? 'page' : undefined}
                      className="border-t border-border py-4 font-display text-2xl font-bold hover:text-accent"
                    >
                      {label}
                    </Link>
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
