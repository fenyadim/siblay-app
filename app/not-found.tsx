import { ArrowRight, Home } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Запрошенная страница не существует или была перемещена.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/" aria-label="Siblay — на главную">
          <Logo className="text-base" markClassName="h-6" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl text-center">
          <p className="label-mono mb-6 text-accent">ERROR_404</p>

          <h1 className="text-7xl sm:text-9xl font-black tracking-tighter text-foreground font-display mb-4 leading-none">
            404
          </h1>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4 font-display">
            Страница не найдена
          </h2>

          <p className="text-base text-muted leading-relaxed mb-10 max-w-md mx-auto">
            Возможно, она была перемещена, удалена или адрес введён с ошибкой. Это легко
            исправить.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full bg-accent hover:bg-(--accent-hover) text-white">
              <Link href="/">
                <Home className="size-4" />
                На главную
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/portfolio">
                Посмотреть работы
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="px-4 sm:px-6 lg:px-8 py-6 text-xs text-muted text-center font-mono">
        © {new Date().getFullYear()} Siblay
      </footer>
    </div>
  )
}
