"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { createPortal } from "react-dom"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useScroll } from "@/hooks/use-scroll"

const NAV_LINKS = [
  { href: "/#services", label: "Услуги" },
  { href: "/#how-it-works", label: "Как мы работаем" },
  { href: "/portfolio", label: "Портфолио" },
]

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const scrolled = useScroll(16)

  return (
    <>
      {/* Outer wrapper — always fixed, full width, no layout changes */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "transition-[padding] duration-300 ease-in-out",
          scrolled ? "pt-3 px-4" : "pt-0 px-0",
        )}
      >
        {/* Inner pill — fixed max-width, only VISUAL properties transition */}
        <div
          className={cn(
            "mx-auto flex items-center justify-between px-4 h-14",
            "transition-[background-color,border-color,box-shadow,border-radius] duration-300 ease-in-out",
            scrolled
              ? [
                  "max-w-[800px]",
                  "rounded-full",
                  "border border-[var(--border)]",
                  "bg-[var(--surface)]/80 backdrop-blur-xl",
                  "shadow-md shadow-black/[0.06]",
                ].join(" ")
              : [
                  "max-w-7xl sm:px-6 lg:px-8",
                  "rounded-none",
                  "border border-transparent",
                  "bg-[var(--background)]",
                  "shadow-none",
                ].join(" "),
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className="text-lg font-black tracking-tight text-[var(--foreground)]"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Siblay
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-150",
                  pathname === link.href
                    ? "text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]",
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <Button
              asChild
              size="sm"
              className={cn(
                "hidden md:flex text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)]",
                "transition-[border-radius] duration-300 ease-in-out",
                scrolled ? "rounded-full h-8 px-4 text-xs" : "rounded-lg",
              )}
            >
              <Link href="/order">Оформить заказ</Link>
            </Button>

            {/* Mobile burger */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--border)] transition-colors"
              aria-label="Меню"
            >
              <AnimatedBurger open={open} />
            </button>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-14" />

      {/* Mobile fullscreen menu */}
      {open && <MobileMenu links={NAV_LINKS} onClose={() => setOpen(false)} />}
    </>
  )
}

function AnimatedBurger({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={cn("transition-transform duration-300", open && "-rotate-45")}
    >
      <path
        className={cn(
          "transition-all duration-300",
          open
            ? "[stroke-dasharray:20_300] [stroke-dashoffset:-32.42px]"
            : "[stroke-dasharray:12_63]",
        )}
        d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
      />
      <path d="M7 16 27 16" />
    </svg>
  )
}

function MobileMenu({
  links,
  onClose,
}: {
  links: typeof NAV_LINKS
  onClose: () => void
}) {
  if (typeof window === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-40 md:hidden">
      <div
        className="absolute inset-0 bg-[var(--background)]/95 backdrop-blur-xl"
        onClick={onClose}
      />
      <div className="relative flex flex-col h-full px-6 pt-24 pb-10 animate-in slide-in-from-top-2 duration-200">
        <nav className="flex flex-col gap-1 flex-1">
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl text-lg font-semibold text-[var(--foreground)] hover:bg-[var(--surface)] hover:text-[var(--accent)] transition-colors"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              <span className="text-xs font-mono text-[var(--accent)] w-6">0{i + 1}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-3 pt-6 border-t border-[var(--border)]">
          <Button
            asChild
            className="w-full rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white h-12 text-base"
          >
            <Link href="/order" onClick={onClose}>
              Оформить заказ
            </Link>
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
