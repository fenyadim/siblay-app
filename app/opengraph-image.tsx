import { ImageResponse } from 'next/og'

export const alt = 'Siblay — 3D-моделирование и 3D-печать на заказ'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#fafaf6',
          color: '#0d0d0d',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 512 512">
            <rect width="512" height="512" rx="112" fill="#0d0d0d" />
            <g transform="translate(96 112) scale(4)">
              <g fill="#fafaf6">
                <path d="M 6 16 Q 24 6 42 16 Q 60 26 76 18 L 76 25 Q 60 33 42 23 Q 24 13 6 23 Z" />
                <path d="M 6 36 Q 24 26 42 36 Q 60 46 76 38 L 76 45 Q 60 53 42 43 Q 24 33 6 43 Z" />
                <path d="M 6 56 Q 24 46 42 56 Q 60 66 76 58 L 76 65 Q 60 73 42 63 Q 24 53 6 63 Z" />
              </g>
              <circle cx="76" cy="18" r="4" fill="#0a5efa" />
            </g>
          </svg>
          <div
            style={{
              fontSize: 44,
              fontWeight: 900,
              letterSpacing: '-0.03em',
            }}
          >
            Siblay
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 22,
              fontFamily: 'monospace',
              color: '#0a5efa',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            3D-моделирование · 3D-печать
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              maxWidth: 980,
            }}
          >
            Точность в каждом слое
          </div>
          <div
            style={{
              fontSize: 30,
              color: '#525252',
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            Прототипы, серийные изделия, постобработка. PLA, PETG, TPU.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            fontFamily: 'monospace',
            color: '#525252',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <span>siblay.ru</span>
          <span>50+ заказов · от 24ч</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
