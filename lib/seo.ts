/**
 * Единый источник SEO- и контактных данных бизнеса (NAP — Name, Address,
 * Phone). Используется в метаданных, JSON-LD разметке и при необходимости
 * в UI. Меняйте значения здесь — они подхватятся везде.
 */

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://siblay.ru'

export const business = {
  name: 'Siblay',
  legalName: 'Siblay',
  email: 'info@siblay.ru',
  // В формате для tel:/schema (без скобок и пробелов).
  phone: '+79140004653',
  phoneDisplay: '+7 (914) 000-46-53',
  address: {
    country: 'RU',
    region: 'Иркутская область',
    city: 'Иркутск',
    street: 'проезд Юрия Тена',
    // TODO: уточните номер дома и индекс — нужны для Яндекс.Бизнеса и Google.
    postalCode: '',
  },
  /**
   * Координаты района «проезд Юрия Тена», Иркутск — приблизительные.
   * TODO: замените на точные из Яндекс.Карт (правый клик → «Что здесь?»).
   */
  geo: {
    latitude: 52.2864,
    longitude: 104.2807,
  },
  /**
   * Часы работы в формате schema.org. Скорректируйте под реальный график.
   */
  openingHours: ['Mo-Fr 09:00-18:00', 'Sa 10:00-15:00'],
  sameAs: [
    'https://t.me/siblay_print',
    'https://vk.com/dima_orlov1',
  ],
} as const

const fullAddress = [business.address.street, business.address.city]
  .filter(Boolean)
  .join(', ')

/**
 * Organization + LocalBusiness разметка. LocalBusiness с адресом, телефоном
 * и геокоординатами помогает ранжироваться по локальным запросам вида
 * «3D-печать в Иркутске».
 */
export function getBusinessJsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}#organization`,
    name: business.name,
    url: siteUrl,
    logo: `${siteUrl}/siblay-logo.svg`,
    description:
      'Профессиональные услуги 3D-моделирования и 3D-печати на заказ в Иркутске. PLA, PETG, TPU.',
    email: business.email,
    telephone: business.phone,
    areaServed: 'RU',
    sameAs: business.sameAs,
  }

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteUrl}#localbusiness`,
    name: `${business.name} — 3D-печать и 3D-моделирование в Иркутске`,
    image: `${siteUrl}/opengraph-image`,
    url: siteUrl,
    telephone: business.phone,
    email: business.email,
    priceRange: '₽₽',
    description:
      'Студия 3D-печати и 3D-моделирования в Иркутске: печать прототипов, ' +
      'деталей и серийных изделий из PLA, PETG, TPU, 3D-сканирование и ' +
      'реверс-инжиниринг.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode || undefined,
      addressCountry: business.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    },
    openingHours: business.openingHours,
    areaServed: [
      { '@type': 'City', name: 'Иркутск' },
      { '@type': 'State', name: 'Иркутская область' },
      { '@type': 'Country', name: 'Россия' },
    ],
    parentOrganization: { '@id': `${siteUrl}#organization` },
    sameAs: business.sameAs,
  }

  return { organization, localBusiness, fullAddress }
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}#website`,
  url: siteUrl,
  name: business.name,
  inLanguage: 'ru-RU',
  publisher: { '@id': `${siteUrl}#organization` },
}

export { websiteJsonLd }
