"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"

interface PortfolioGalleryProps {
  images: string[]
  imageBlurs?: string[]
  title: string
}

export function PortfolioGallery({ images, imageBlurs = [], title }: PortfolioGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl border border-border bg-surface flex items-center justify-center">
        <span className="text-7xl opacity-10">◈</span>
      </div>
    )
  }

  const activeImage = images[activeIndex] ?? images[0]
  const activeBlur = imageBlurs[activeIndex]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square rounded-2xl border border-border bg-surface overflow-hidden">
        <Image
          src={activeImage}
          alt={
            activeIndex === 0 ? title : `${title} — фото ${activeIndex + 1}`
          }
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          {...(activeBlur
            ? { placeholder: "blur" as const, blurDataURL: activeBlur }
            : {})}
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => {
            const blur = imageBlurs[i]
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Показать фото ${i + 1}`}
                aria-current={i === activeIndex}
                className={cn(
                  "relative aspect-square rounded-xl border bg-surface overflow-hidden transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 cursor-pointer",
                  i === activeIndex
                    ? "border-accent ring-2 ring-accent"
                    : "border-border hover:border-accent/60"
                )}
              >
                <Image
                  src={img}
                  alt={`${title} — миниатюра ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 25vw, 12vw"
                  className="object-cover"
                  {...(blur
                    ? { placeholder: "blur" as const, blurDataURL: blur }
                    : {})}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
