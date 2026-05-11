import type { MaterialWithColors } from '@/actions/materials'
import { formatMaterialPrice } from '@/lib/utils'

export function MaterialCard({ mat }: { mat: MaterialWithColors }) {
  const accent = mat.color || '#a7a7a7'
  const props = mat.props ?? []

  return (
    <div className="group relative card-hover p-5 rounded-2xl border border-border bg-surface-raised flex flex-col h-full hover:border-(--accent-border) transition-all duration-300 overflow-hidden">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${accent}18 0%, transparent 60%)`,
        }}
      />

      {!mat.available && (
        <span className="absolute top-3 right-3 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-400 text-white">
          Скоро
        </span>
      )}

      <div className="flex items-center gap-3 mb-3 relative">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}66` }}
        />
        <span className="text-xl font-black text-foreground font-display">{mat.name}</span>
      </div>
      {mat.fullName && (
        <p className="text-xs text-muted font-mono mb-3 leading-snug relative">{mat.fullName}</p>
      )}
      {mat.longDesc && (
        <p className="text-xs text-muted leading-relaxed flex-1 relative">{mat.longDesc}</p>
      )}
      {props.length > 0 && (
        <div className="mt-4 space-y-1 relative">
          {props.map((p) => (
            <div key={p} className="flex items-center gap-1.5 text-xs text-muted">
              <span className="text-accent">·</span>
              {p}
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 pt-3 border-t border-border relative">
        <span className="text-sm font-mono font-medium text-accent">
          {formatMaterialPrice(mat.price)}
        </span>
      </div>
    </div>
  )
}
