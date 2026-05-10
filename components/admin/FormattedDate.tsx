"use client"

import { useEffect, useState } from "react"

interface Props {
  date: Date | string
  className?: string
}

const FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}

export function FormattedDate({ date, className }: Props) {
  const iso = typeof date === "string" ? date : date.toISOString()

  // Server render uses UTC to keep markup deterministic; client effect
  // re-renders in the visitor's local timezone after hydration.
  const [formatted, setFormatted] = useState(() =>
    new Intl.DateTimeFormat("ru-RU", { ...FORMAT_OPTIONS, timeZone: "UTC" }).format(new Date(iso))
  )

  useEffect(() => {
    setFormatted(new Intl.DateTimeFormat("ru-RU", FORMAT_OPTIONS).format(new Date(iso)))
  }, [iso])

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {formatted}
    </time>
  )
}
