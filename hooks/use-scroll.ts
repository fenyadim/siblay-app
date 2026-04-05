"use client"

import { useCallback, useEffect, useState } from "react"

export function useScroll(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)

  const onScroll = useCallback(() => {
    setScrolled(window.scrollY > threshold)
  }, [threshold])

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [onScroll])

  useEffect(() => {
    onScroll()
  }, [onScroll])

  return scrolled
}
