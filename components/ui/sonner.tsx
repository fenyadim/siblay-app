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
            "group toast group-[.toaster]:bg-surface group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted",
          actionButton: "group-[.toast]:bg-accent group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-surface group-[.toast]:text-muted",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
