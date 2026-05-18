import { describe, expect, it } from 'vitest'

import {
  AVATAR_PALETTE,
  averageRating,
  avatarColor,
  buildReviewsJsonLdForLocalBusiness,
  formatReviewDate,
} from './reviews'

describe('formatReviewDate', () => {
  it('форматирует дату в "13 мая 2026" для русской локали', () => {
    expect(formatReviewDate(new Date('2026-05-13T00:00:00Z'))).toBe('13 мая 2026 г.')
  })

  it('принимает строку ISO', () => {
    expect(formatReviewDate('2026-05-13')).toBe('13 мая 2026 г.')
  })
})

describe('avatarColor', () => {
  it('детерминирован: одно имя → один цвет', () => {
    expect(avatarColor('Наталья')).toBe(avatarColor('Наталья'))
  })

  it('возвращает цвет из палитры', () => {
    expect(AVATAR_PALETTE).toContain(avatarColor('Наталья'))
  })

  it('обрабатывает пустую строку', () => {
    expect(AVATAR_PALETTE).toContain(avatarColor(''))
  })

  it('распределяет разные имена', () => {
    const colors = new Set(['Анна', 'Борис', 'Виктор', 'Галина', 'Дмитрий'].map(avatarColor))
    expect(colors.size).toBeGreaterThan(1)
  })
})

describe('averageRating', () => {
  it('считает среднее с одним знаком после запятой', () => {
    expect(averageRating([5, 5, 4, 5, 3])).toBe(4.4)
  })

  it('возвращает null для пустого массива', () => {
    expect(averageRating([])).toBeNull()
  })

  it('возвращает 5 для всех пятёрок', () => {
    expect(averageRating([5, 5, 5])).toBe(5)
  })
})

describe('buildReviewsJsonLdForLocalBusiness', () => {
  const siteUrl = 'https://siblay.ru'

  it('возвращает null для пустого массива', () => {
    expect(buildReviewsJsonLdForLocalBusiness([], siteUrl)).toBeNull()
  })

  it('строит фрагмент с aggregateRating и review для одного отзыва', () => {
    const review = {
      authorName: 'Наталья',
      reviewDate: new Date('2026-05-13T00:00:00Z'),
      rating: 5,
      text: 'Работа выполнена качественно и в срок. Рекомендую.',
    }

    const fragment = buildReviewsJsonLdForLocalBusiness([review], siteUrl)

    expect(fragment).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}#localbusiness`,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5.0',
        reviewCount: 1,
        bestRating: '5',
        worstRating: '1',
      },
      review: [
        {
          '@type': 'Review',
          author: { '@type': 'Person', name: 'Наталья' },
          datePublished: '2026-05-13',
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
            worstRating: '1',
          },
          reviewBody: 'Работа выполнена качественно и в срок. Рекомендую.',
        },
      ],
    })
  })
})
