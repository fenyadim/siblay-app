/**
 * Чистые утилиты для секции отзывов: форматер даты, детерминированный
 * цвет аватарки и фрагмент Schema.org-разметки, объединяемый с глобальным
 * LocalBusiness JSON-LD по совпадающему `@id`.
 */

export const AVATAR_PALETTE = [
  '#0ea5e9', // sky-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
] as const

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatReviewDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  return dateFormatter.format(date)
}

export function avatarColor(name: string): string {
  let sum = 0
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i)
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length]
}

export function averageRating(ratings: readonly number[]): number | null {
  if (ratings.length === 0) return null
  const sum = ratings.reduce((acc, r) => acc + r, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

export interface ReviewForJsonLd {
  authorName: string
  reviewDate: Date
  rating: number
  text: string
}

export function buildReviewsJsonLdForLocalBusiness(
  reviews: readonly ReviewForJsonLd[],
  siteUrl: string,
): Record<string, unknown> | null {
  if (reviews.length === 0) return null
  const avg = averageRating(reviews.map((r) => r.rating))!
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteUrl}#localbusiness`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length,
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.authorName },
      datePublished: r.reviewDate.toISOString().slice(0, 10),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(r.rating),
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: r.text,
    })),
  }
}
