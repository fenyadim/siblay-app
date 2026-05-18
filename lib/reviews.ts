/**
 * Чистые утилиты для секции отзывов: форматер даты, детерминированный
 * цвет аватарки и фрагмент Schema.org-разметки, объединяемый с глобальным
 * LocalBusiness JSON-LD по совпадающему `@id`.
 */

// Цвета подобраны так, чтобы белый текст инициала проходил WCAG AA
// для крупного текста (≥3:1). amber-500/red-500 не проходили, поэтому
// палитра целиком сдвинута на 600-е варианты для визуального единства.
export const AVATAR_PALETTE = [
  '#0284c7', // sky-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#dc2626', // red-600
  '#7c3aed', // violet-600
  '#db2777', // pink-600
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
