import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Siblay — 3D-моделирование и печать',
    short_name: 'Siblay',
    description:
      'Профессиональные услуги 3D-моделирования и 3D-печати на заказ. PLA, PETG, TPU.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fafaf6',
    theme_color: '#fafaf6',
    lang: 'ru',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      {
        src: '/icon0.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon1.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
