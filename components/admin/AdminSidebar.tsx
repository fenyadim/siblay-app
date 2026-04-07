"use client"

import { signOut } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const NAV = [
  { href: "/admin", label: "Дашборд", icon: "⬡" },
  { href: "/admin/orders", label: "Заказы", icon: "◫" },
  { href: "/admin/portfolio", label: "Портфолио", icon: "◈" },
  { href: "/admin/materials", label: "Материалы", icon: "◉" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push("/admin/login")
  }

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface flex flex-col min-h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-black text-sm text-foreground" style={{ fontFamily: "Syne, sans-serif" }}>
            Siblay
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-(--accent-subtle) text-accent"
                  : "text-muted hover:text-foreground hover:bg-background",
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
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-background transition-colors"
        >
          <span>↗</span> На сайт
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-destructive hover:bg-background transition-colors"
        >
          <span>⏻</span> Выйти
        </button>
      </div>
    </aside>
  )
}
