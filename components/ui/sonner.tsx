"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--surface)] group-[.toaster]:text-[var(--foreground)] group-[.toaster]:border-[var(--border)] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[var(--muted)]",
          actionButton: "group-[.toast]:bg-[var(--accent)] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-[var(--surface)] group-[.toast]:text-[var(--muted)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
