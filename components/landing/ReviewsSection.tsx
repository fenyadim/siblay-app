import { getPublishedReviews } from "@/actions/reviews"
import { buildReviewsJsonLdForLocalBusiness } from "@/lib/reviews"
import { siteUrl } from "@/lib/seo"

import { ReviewsCarousel } from "./ReviewsCarousel"

export async function ReviewsSection() {
  const reviews = await getPublishedReviews()

  if (reviews.length === 0) return null

  const jsonLd = buildReviewsJsonLdForLocalBusiness(reviews, siteUrl)

  const carouselReviews = reviews.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    reviewDate: r.reviewDate,
    rating: r.rating,
    text: r.text,
    sourceUrl: r.sourceUrl,
  }))

  return (
    <section className="py-14 sm:py-24 bg-background">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 sm:mb-16">
          <div>
            <span className="label-mono mb-3 text-sm block">Отзывы</span>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-none font-display">
              Что говорят клиенты
            </h2>
            <p className="mt-4 text-sm text-muted max-w-md">
              Реальные оценки наших клиентов с Avito.
            </p>
          </div>
        </div>

        <ReviewsCarousel reviews={carouselReviews} />
      </div>
    </section>
  )
}
