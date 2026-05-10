'use client'

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[app:global-error]", error)
  }, [error])

  return (
    <html lang="ru">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          background: "#0d0d0d",
          color: "#fafaf6",
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            padding: "1.5rem clamp(1rem, 4vw, 2rem)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            fontStyle: "italic",
            textTransform: "uppercase",
            fontSize: "1.05rem",
          }}
        >
          Siblay<span style={{ color: "#7c5cff" }}>.</span>
        </header>

        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem",
          }}
        >
          <div style={{ maxWidth: "32rem", textAlign: "center" }}>
            <p
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(250, 250, 246, 0.5)",
                marginBottom: "1.5rem",
                fontFamily: "ui-monospace, 'SF Mono', monospace",
              }}
            >
              CRITICAL_ERROR
            </p>

            <h1
              style={{
                fontSize: "clamp(1.75rem, 5vw, 3rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                margin: "0 0 1rem",
                lineHeight: 1.1,
              }}
            >
              Что-то пошло не так
            </h1>

            <p
              style={{
                color: "rgba(250, 250, 246, 0.7)",
                lineHeight: 1.6,
                margin: "0 auto 2rem",
                maxWidth: "26rem",
              }}
            >
              Произошла критическая ошибка приложения. Попробуйте обновить страницу.
            </p>

            {error.digest && (
              <p
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "ui-monospace, 'SF Mono', monospace",
                  color: "rgba(250, 250, 246, 0.5)",
                  marginBottom: "2rem",
                }}
              >
                ID: {error.digest}
              </p>
            )}

            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.75rem",
                borderRadius: "999px",
                background: "#7c5cff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: 500,
                fontFamily: "inherit",
              }}
            >
              Попробовать снова
            </button>
          </div>
        </main>

        <footer
          style={{
            padding: "1.5rem clamp(1rem, 4vw, 2rem)",
            fontSize: "0.75rem",
            color: "rgba(250, 250, 246, 0.5)",
            textAlign: "center",
            fontFamily: "ui-monospace, 'SF Mono', monospace",
          }}
        >
          © {new Date().getFullYear()} Siblay
        </footer>
      </body>
    </html>
  )
}
