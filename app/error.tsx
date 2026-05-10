'use client'

import { Home, RotateCw } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[app:error]", error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/" aria-label="Siblay — на главную">
          <Logo className="text-base" markClassName="h-6" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl text-center">
          <p className="label-mono mb-6 text-(--error)">ERROR_500</p>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-foreground font-display mb-6 leading-tight">
            Что-то пошло не так
          </h1>

          <p className="text-base text-muted leading-relaxed mb-2 max-w-md mx-auto">
            Мы уже знаем о проблеме и работаем над её решением. Попробуйте обновить
            страницу или вернуться позже.
          </p>

          {error.digest && (
            <p className="text-xs font-mono text-muted mt-4 mb-10">
              ID:{" "}
              <span className="px-2 py-0.5 rounded-md bg-surface border border-border">
                {error.digest}
              </span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Button
              onClick={reset}
              size="lg"
              className="rounded-full bg-accent hover:bg-(--accent-hover) text-white"
            >
              <RotateCw className="size-4" />
              Попробовать снова
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/">
                <Home className="size-4" />
                На главную
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
