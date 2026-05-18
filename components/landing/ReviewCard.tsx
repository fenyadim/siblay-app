import { ArrowUpRight } from "lucide-react"

import { avatarColor, formatReviewDate } from "@/lib/reviews"

export interface ReviewCardData {
  id: string
  authorName: string
  reviewDate: Date
  rating: number
  text: string
  sourceUrl: string | null
}

export function ReviewCard({ review }: { review: ReviewCardData }) {
  const initial = review.authorName.charAt(0).toUpperCase() || "?"
  const bg = avatarColor(review.authorName)

  return (
    <article className="h-full rounded-2xl border border-border bg-surface p-6 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: bg }}
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{review.authorName}</p>
          <p className="text-xs text-muted font-mono">{formatReviewDate(review.reviewDate)}</p>
        </div>
      </header>

      <div className="flex gap-0.5 text-amber-500" aria-label={`Оценка ${review.rating} из 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < review.rating ? "text-amber-500" : "text-border"}>
            ★
          </span>
        ))}
      </div>

      <p className="text-sm text-foreground leading-relaxed flex-1 whitespace-pre-line">
        {review.text}
      </p>

      {review.sourceUrl && (
        <a
          href={review.sourceUrl}
          target="_blank"
          rel="nofollow noopener"
          className="self-end inline-flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors"
        >
          Источник <ArrowUpRight size={12} />
        </a>
      )}
    </article>
  )
}
