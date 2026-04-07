import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface border-b border-border">
      {/* Dot grid background */}
      <div className="absolute inset-0 bg-dot-grid opacity-60 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-150">
          {/* Left: Text */}
          <div className="flex flex-col justify-center py-16 lg:py-24 lg:pr-16">
            <div className="mb-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-(--accent-border) bg-(--accent-subtle) text-accent label-mono">
                <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                3D-моделирование и печать
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight text-foreground mb-6 font-display">
              Точность <span className="md:block! gradient-text">в каждом</span> слое
            </h1>

            <p className="text-lg text-muted max-w-md leading-relaxed mb-8">
              Профессиональная 3D-печать и моделирование под заказ. PLA, PETG, TPU — от прототипа до
              серии.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-(--accent-hover) text-white rounded-xl px-8 font-semibold"
              >
                <Link href="/order">Оформить заказ</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border text-foreground hover:bg-background/50 hover:text-foreground rounded-xl px-8"
              >
                <Link href="/portfolio">Смотреть работы</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-border">
              {[
                { value: '500+', label: 'заказов' },
                { value: '5', label: 'материалов' },
                { value: '24ч', label: 'срок от' },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    className="text-2xl font-black text-foreground"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    {s.value}
                  </div>
                  <div className="label-mono mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Printer Visual */}
          <div className="hidden lg:flex items-center justify-center relative border-l border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-subtle)] via-transparent to-transparent opacity-50" />
            <PrinterVisual />
          </div>
        </div>
      </div>
    </section>
  )
}

// Container: 300×300
// Frame: SVG rect (42,18)→(258,258)
// Print area x: [58..242] = 184px wide, y rows: [38,64,90,116,142,168,194] spacing=26px
// Path: 7 horizontal passes + 6 vertical drops = 7×184 + 6×26 = 1288+156 = 1444px → dasharray=1500
// Head center offset: nozzle tip 16px below head center, so head.top = path.y − 16
// Animation: 16s | 0-3% idle | 3-70% draw | 70-78% pause | 78-83% fade | 83.1% jump | 83.1-100% fade-in

// Path goes bottom→top: starts at lower-left, zigzags upward
const ZZ_PATH =
  'M 58,194 L 242,194 ' +
  'L 242,168 L 58,168 ' +
  'L 58,142 L 242,142 ' +
  'L 242,116 L 58,116 ' +
  'L 58,90 L 242,90 ' +
  'L 242,64 L 58,64 ' +
  'L 58,38 L 242,38'

function PrinterVisual() {
  return (
    <div className="relative" style={{ width: 300, height: 300 }}>
      <style>{`
        /* ── Head moves bottom→top along the zigzag path ── */
        /* head.top = path.y − 16 (nozzle tip sits at path y) */
        @keyframes head-print {
          0%    { left:58px;  top:178px; opacity:1; }
          3%    { left:58px;  top:178px; opacity:1; }
          11.5% { left:242px; top:178px; opacity:1; }
          12.7% { left:242px; top:152px; opacity:1; }
          21.3% { left:58px;  top:152px; opacity:1; }
          22.5% { left:58px;  top:126px; opacity:1; }
          31%   { left:242px; top:126px; opacity:1; }
          32.2% { left:242px; top:100px; opacity:1; }
          40.7% { left:58px;  top:100px; opacity:1; }
          42%   { left:58px;  top:74px;  opacity:1; }
          50.5% { left:242px; top:74px;  opacity:1; }
          51.7% { left:242px; top:48px;  opacity:1; }
          60.2% { left:58px;  top:48px;  opacity:1; }
          61.4% { left:58px;  top:22px;  opacity:1; }
          70%   { left:242px; top:22px;  opacity:1; }
          78%   { left:242px; top:22px;  opacity:1; }
          83%   { left:242px; top:22px;  opacity:0; }
          83.1% { left:58px;  top:178px; opacity:0; }
          100%  { left:58px;  top:178px; opacity:1; }
        }
        /* ── X-rod tracks head's vertical position ── */
        @keyframes xrod-print {
          0%    { top:178px; opacity:1; }
          3%    { top:178px; }
          11.5% { top:178px; }
          12.7% { top:152px; }
          21.3% { top:152px; }
          22.5% { top:126px; }
          31%   { top:126px; }
          32.2% { top:100px; }
          40.7% { top:100px; }
          42%   { top:74px; }
          50.5% { top:74px; }
          51.7% { top:48px; }
          60.2% { top:48px; }
          61.4% { top:22px; }
          70%   { top:22px;  opacity:1; }
          78%   { top:22px;  opacity:1; }
          83%   { top:22px;  opacity:0; }
          83.1% { top:178px; opacity:0; }
          100%  { top:178px; opacity:1; }
        }
        /* ── SVG path progressively drawn ── */
        /* dasharray = actual path length = 7×184 + 6×26 = 1444px → perfect sync */
        @keyframes draw-zz {
          0%    { stroke-dashoffset:1444; opacity:1; }
          3%    { stroke-dashoffset:1444; }
          70%   { stroke-dashoffset:0;    opacity:1; }
          78%   { stroke-dashoffset:0;    opacity:1; }
          83%   { stroke-dashoffset:0;    opacity:0; }
          83.1% { stroke-dashoffset:1444; opacity:0; }
          100%  { stroke-dashoffset:1444; opacity:1; }
        }
        /* ── Nozzle glow pulse ── */
        @keyframes nozzle-pulse {
          0%,100% { box-shadow: 0 0 6px color-mix(in oklch, var(--accent-hover) 80%, transparent); }
          50%     { box-shadow: 0 0 12px var(--accent-hover), 0 0 20px color-mix(in oklch, var(--accent) 40%, transparent); }
        }
      `}</style>

      {/* Background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 220,
          height: 130,
          bottom: 48,
          left: 40,
          background:
            'radial-gradient(ellipse, color-mix(in oklch, var(--accent) 11%, transparent) 0%, transparent 70%)',
        }}
      />

      {/* ── SVG layer: frame outline + progressive zigzag path ── */}
      <svg
        width="300"
        height="300"
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
      >
        {/* Frame */}
        <rect
          x="42"
          y="18"
          width="216"
          height="240"
          fill="none"
          strokeWidth={1.5}
          rx={3}
          style={{ stroke: 'color-mix(in oklch, var(--accent) 22%, transparent)' }}
        />
        {/* Platform */}
        <rect
          x="52"
          y="256"
          width="196"
          height="4"
          rx={2}
          style={{ fill: 'color-mix(in oklch, var(--accent) 38%, transparent)' }}
        />

        {/* Zigzag glow (blurred duplicate) */}
        <path
          d={ZZ_PATH}
          fill="none"
          strokeWidth={11}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1444}
          style={{
            stroke: 'color-mix(in oklch, var(--accent) 22%, transparent)',
            filter: 'blur(5px)',
            animation: 'draw-zz 16s linear infinite',
          }}
        />
        {/* Zigzag main stroke */}
        <path
          d={ZZ_PATH}
          fill="none"
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={1444}
          style={{
            stroke: 'color-mix(in oklch, var(--accent) 58%, transparent)',
            animation: 'draw-zz 16s linear infinite',
          }}
        />
      </svg>

      {/* ── Vertical rods ── */}
      <div
        style={{
          position: 'absolute',
          left: 42,
          top: 18,
          width: 2,
          height: 240,
          background: 'color-mix(in oklch, var(--accent) 35%, transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 42,
          top: 18,
          width: 2,
          height: 240,
          background: 'color-mix(in oklch, var(--accent) 35%, transparent)',
        }}
      />

      {/* ── Corner accents ── */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 40,
          width: 10,
          height: 10,
          borderTop: '2px solid color-mix(in oklch, var(--accent) 70%, transparent)',
          borderLeft: '2px solid color-mix(in oklch, var(--accent) 70%, transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 40,
          width: 10,
          height: 10,
          borderTop: '2px solid color-mix(in oklch, var(--accent) 70%, transparent)',
          borderRight: '2px solid color-mix(in oklch, var(--accent) 70%, transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 41,
          left: 40,
          width: 10,
          height: 10,
          borderBottom: '2px solid color-mix(in oklch, var(--accent) 70%, transparent)',
          borderLeft: '2px solid color-mix(in oklch, var(--accent) 70%, transparent)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 41,
          right: 40,
          width: 10,
          height: 10,
          borderBottom: '2px solid color-mix(in oklch, var(--accent) 70%, transparent)',
          borderRight: '2px solid color-mix(in oklch, var(--accent) 70%, transparent)',
        }}
      />

      {/* ── X-rod (horizontal bar at current row height) ── */}
      <div
        style={{
          position: 'absolute',
          left: 42,
          right: 42,
          height: 2,
          background: 'color-mix(in oklch, var(--accent) 50%, transparent)',
          zIndex: 4,
          animation: 'xrod-print 16s linear infinite',
        }}
      />

      {/* ── Print head ── */}
      <div
        style={{
          position: 'absolute',
          width: 28,
          height: 14,
          background: 'var(--accent)',
          borderRadius: 3,
          transform: 'translate(-50%, -50%)',
          zIndex: 5,
          boxShadow: '0 0 10px color-mix(in oklch, var(--accent) 65%, transparent)',
          animation: 'head-print 16s linear infinite',
        }}
      >
        {/* Nozzle tip */}
        <div
          style={{
            position: 'absolute',
            bottom: -9,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 5,
            height: 9,
            background: 'var(--accent-hover)',
            borderRadius: '0 0 3px 3px',
            animation: 'nozzle-pulse 0.7s ease-in-out infinite',
          }}
        />
      </div>

      {/* Label */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
        <span className="label-mono text-accent">3D Print Preview</span>
      </div>
    </div>
  )
}
