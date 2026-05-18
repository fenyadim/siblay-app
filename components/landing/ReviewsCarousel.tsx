"use client"

import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { ReviewCard, type ReviewCardData } from "./ReviewCard"

export function ReviewsCarousel({ reviews }: { reviews: ReviewCardData[] }) {
  const enableLoop = reviews.length > 3
  const autoplay = useRef(
    Autoplay({ delay: 6000, stopOnInteraction: false, stopOnMouseEnter: true }),
  )
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: enableLoop, align: "start", dragFree: false },
    enableLoop ? [autoplay.current] : [],
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => {
    setSelectedIndex(api.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    onSelect(emblaApi)
    emblaApi.on("select", onSelect).on("reInit", (api) => {
      setScrollSnaps(api.scrollSnapList())
      onSelect(api)
    })
  }, [emblaApi, onSelect])

  const showControls = enableLoop && scrollSnaps.length > 1

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Отзывы клиентов"
    >
      {showControls && (
        <div className="absolute -top-14 right-0 hidden sm:flex gap-2 z-10">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Предыдущий отзыв"
            className="w-9 h-9 rounded-full border border-border bg-surface-raised flex items-center justify-center text-muted hover:text-accent hover:border-(--accent-border) transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Следующий отзыв"
            className="w-9 h-9 rounded-full border border-border bg-surface-raised flex items-center justify-center text-muted hover:text-accent hover:border-(--accent-border) transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div
        className="overflow-hidden -mx-2 select-none cursor-grab active:cursor-grabbing touch-pan-y"
        ref={emblaRef}
      >
        <div className="flex py-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3 min-w-0 px-2"
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>

      {showControls && (
        <div className="flex justify-center gap-2 mt-6">
          {scrollSnaps.map((_, i) => {
            const active = i === selectedIndex
            return (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Перейти к отзыву ${i + 1}`}
                aria-current={active}
                className={`h-2 rounded-full transition-all ${
                  active ? "w-6 bg-accent" : "w-2 bg-border hover:bg-muted"
                }`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
