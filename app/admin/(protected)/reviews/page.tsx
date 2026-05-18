import { ReviewsAdminClient } from "@/components/admin/ReviewsAdminClient"
import { getAllReviews } from "@/actions/reviews"

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-foreground font-display">
          Отзывы
        </h1>
      </div>

      <ReviewsAdminClient
        items={reviews.map((r) => ({
          id: r.id,
          authorName: r.authorName,
          reviewDate: r.reviewDate.toISOString(),
          rating: r.rating,
          text: r.text,
          sourceUrl: r.sourceUrl ?? undefined,
          published: r.published,
          updatedAt: r.updatedAt.toISOString(),
        }))}
      />
    </div>
  )
}
