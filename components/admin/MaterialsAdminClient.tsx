'use client'

import { useState, useTransition } from 'react'

import type { MaterialWithColors } from '@/actions/materials'
import {
  addMaterialColor,
  createMaterial,
  deleteMaterialColor,
  updateMaterial,
  updateMaterialColor,
} from '@/actions/materials'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatMaterialPrice, parseMaterialPrice } from '@/lib/utils'

interface Props {
  materials: MaterialWithColors[]
}

function toColorInputValue(value: string, fallback = '#ffffff') {
  const trimmed = value.trim()
  if (/^#[\da-fA-F]{6}$/.test(trimmed)) return trimmed
  if (/^#[\da-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return fallback
}

function ColorDot({ hex, hex2 }: { hex: string; hex2?: string | null }) {
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border border-black/10 shrink-0"
      style={{
        background: hex2 ? `linear-gradient(135deg, ${hex} 50%, ${hex2} 50%)` : hex,
      }}
    />
  )
}

function EditableField({
  value,
  onSave,
  mono = false,
  placeholder,
}: {
  value: string
  onSave: (v: string) => void
  mono?: boolean
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (!editing) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setDraft(value)
          setEditing(true)
        }}
        className={`h-auto min-w-0 w-full justify-start whitespace-normal break-words p-0 text-left font-normal hover:bg-transparent hover:text-accent transition-colors ${mono ? 'font-mono' : ''}`}
      >
        {value || <span className="text-muted italic">{placeholder ?? '—'}</span>}
      </Button>
    )
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSave(draft)
            setEditing(false)
          }
          if (e.key === 'Escape') {
            setEditing(false)
          }
        }}
        className={`border border-accent rounded px-2 py-0.5 text-sm bg-background text-foreground focus:outline-none w-full min-w-0 ${mono ? 'font-mono' : ''}`}
      />
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => {
          onSave(draft)
          setEditing(false)
        }}
        className="text-accent text-xs font-medium whitespace-nowrap"
      >
        ✓
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => setEditing(false)}
        className="text-muted text-xs"
      >
        ✕
      </Button>
    </div>
  )
}

function MultilineField({
  value,
  onSave,
  placeholder,
}: {
  value: string
  onSave: (v: string) => void
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  if (!editing) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setDraft(value)
          setEditing(true)
        }}
        className="h-auto min-w-0 w-full justify-start break-words whitespace-pre-wrap p-0 text-left font-normal leading-relaxed hover:bg-transparent hover:text-accent transition-colors"
      >
        {value || <span className="text-muted italic">{placeholder ?? 'Не задано'}</span>}
      </Button>
    )
  }

  function commit() {
    onSave(draft)
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            commit()
          }
          if (e.key === 'Escape') setEditing(false)
        }}
        placeholder={placeholder}
        className="border border-accent rounded-md bg-background text-foreground min-h-24"
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={commit}
          className="text-accent text-xs font-medium"
        >
          ✓ Сохранить
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => setEditing(false)}
          className="text-muted text-xs"
        >
          ✕ Отмена
        </Button>
        <span className="ml-auto text-[10px] text-muted font-mono">Ctrl+Enter</span>
      </div>
    </div>
  )
}

function ColorPickerField({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [draft, setDraft] = useState(value || '#a7a7a7')
  const [isPending, startTransition] = useTransition()

  function commit() {
    if (draft === value) return
    startTransition(() => onSave(draft))
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="color"
        value={toColorInputValue(draft, '#a7a7a7')}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        className="h-8 w-10 cursor-pointer rounded p-0 shrink-0"
        aria-label="Цвет акцента"
      />
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
        }}
        onBlur={commit}
        placeholder="#hex"
        className="font-mono text-xs border border-border rounded px-2 py-1 bg-background text-foreground focus:outline-none focus:border-accent w-24"
      />
      <span
        className="w-3 h-3 rounded-full shrink-0 border border-black/10"
        style={{ background: draft, boxShadow: `0 0 8px ${draft}66` }}
      />
      {isPending && <span className="text-xs text-muted">…</span>}
    </div>
  )
}

function PropsField({ value, onSave }: { value: string[]; onSave: (v: string[]) => void }) {
  const initial = [value[0] ?? '', value[1] ?? '', value[2] ?? '']
  const [draft, setDraft] = useState<[string, string, string]>([initial[0], initial[1], initial[2]])
  const [isPending, startTransition] = useTransition()

  function update(i: number, v: string) {
    setDraft((prev) => {
      const next = [...prev] as [string, string, string]
      next[i] = v
      return next
    })
  }

  function commit() {
    const cleaned = draft.map((p) => p.trim()).filter(Boolean)
    const same = cleaned.length === value.length && cleaned.every((p, i) => p === value[i])
    if (same) return
    startTransition(() => onSave(cleaned))
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {[0, 1, 2].map((i) => (
        <Input
          key={i}
          value={draft[i]}
          onChange={(e) => update(i, e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            }
          }}
          placeholder={`Тег ${i + 1}`}
          className="border border-border rounded px-2 py-1 text-xs bg-background text-foreground focus:outline-none focus:border-accent w-32"
        />
      ))}
      {isPending && <span className="text-xs text-muted">…</span>}
    </div>
  )
}

function PriceField({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(parseMaterialPrice(value))

  if (!editing) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          setDraft(parseMaterialPrice(value))
          setEditing(true)
        }}
        className="h-auto min-w-0 w-full justify-start whitespace-normal break-words p-0 text-left font-mono font-normal hover:bg-transparent hover:text-accent transition-colors"
      >
        {value ? (
          formatMaterialPrice(value)
        ) : (
          <span className="text-muted italic">Цена не указана</span>
        )}
      </Button>
    )
  }

  function commit() {
    const trimmed = draft.trim().replace(',', '.')
    onSave(trimmed)
    setEditing(false)
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <Input
        autoFocus
        type="number"
        inputMode="decimal"
        min="0"
        step="0.1"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="font-mono border border-accent rounded px-2 py-0.5 text-sm bg-background text-foreground focus:outline-none w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="font-mono text-xs text-muted whitespace-nowrap">₽/г</span>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={commit}
        className="text-accent text-xs font-medium whitespace-nowrap"
      >
        ✓
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => setEditing(false)}
        className="text-muted text-xs"
      >
        ✕
      </Button>
    </div>
  )
}

function ColorRow({
  color,
  materialId,
}: {
  color: MaterialWithColors['colors'][number]
  materialId: string
}) {
  const [isPending, startTransition] = useTransition()
  const [editingHex, setEditingHex] = useState(false)
  const [hexDraft, setHexDraft] = useState(color.hex)
  const [showHex2, setShowHex2] = useState(!!color.hex2)
  const [editingHex2, setEditingHex2] = useState(false)
  const [hex2Draft, setHex2Draft] = useState(color.hex2 ?? '')

  function save(data: Parameters<typeof updateMaterialColor>[1]) {
    startTransition(() => updateMaterialColor(color.id, data))
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0 flex-wrap">
      {/* Color dot + hex editor */}
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <ColorDot hex={color.hex} hex2={color.hex2} />
        {editingHex ? (
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            <Input
              autoFocus
              value={hexDraft}
              onChange={(e) => setHexDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  save({ hex: hexDraft })
                  setEditingHex(false)
                }
                if (e.key === 'Escape') setEditingHex(false)
              }}
              className="font-mono text-xs border border-accent rounded px-1.5 py-0.5 bg-background text-foreground focus:outline-none w-24"
            />
            <Input
              type="color"
              value={toColorInputValue(hexDraft, color.hex)}
              onChange={(e) => setHexDraft(e.target.value)}
              className="h-6 w-6 cursor-pointer rounded p-0"
              aria-label="Выбрать цвет"
            />
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                save({ hex: hexDraft })
                setEditingHex(false)
              }}
              className="text-accent text-xs hover:bg-transparent"
            >
              ✓
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setEditingHex(false)}
              className="text-muted text-xs hover:bg-transparent"
            >
              ✕
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => {
              setHexDraft(color.hex)
              setEditingHex(true)
            }}
            className="font-mono text-xs text-muted hover:bg-transparent hover:text-accent transition-colors"
          >
            {color.hex}
          </Button>
        )}
      </div>

      {/* Hex2 editor */}
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        {showHex2 ? (
          editingHex2 ? (
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              <Input
                autoFocus
                value={hex2Draft}
                onChange={(e) => setHex2Draft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    save({ hex2: hex2Draft || null })
                    setEditingHex2(false)
                  }
                  if (e.key === 'Escape') setEditingHex2(false)
                }}
                className="font-mono text-xs border border-accent rounded px-1.5 py-0.5 bg-background text-foreground focus:outline-none w-24"
                placeholder="#hex2"
              />
              <Input
                type="color"
                value={toColorInputValue(hex2Draft, color.hex2 ?? '#000000')}
                onChange={(e) => setHex2Draft(e.target.value)}
                className="h-6 w-6 cursor-pointer rounded p-0"
                aria-label="Выбрать второй цвет"
              />
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  save({ hex2: hex2Draft || null })
                  setEditingHex2(false)
                }}
                className="text-accent text-xs hover:bg-transparent"
              >
                ✓
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  setShowHex2(false)
                  save({ hex2: null })
                }}
                className="text-red-400 text-xs hover:bg-transparent"
                title="Убрать цвет 2"
              >
                ✕
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => {
                setHex2Draft(color.hex2 ?? '')
                setEditingHex2(true)
              }}
              className="font-mono text-xs text-muted hover:bg-transparent hover:text-accent transition-colors"
            >
              {color.hex2 ?? <span className="italic opacity-60">цвет 2</span>}
            </Button>
          )
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setShowHex2(true)}
            className="text-xs text-accent opacity-60 hover:bg-transparent hover:opacity-100 transition-opacity"
          >
            ＋ цвет 2
          </Button>
        )}
      </div>

      {/* Name */}
      <div className="basis-full min-w-0 sm:basis-auto sm:flex-1">
        <EditableField
          value={color.name}
          onSave={(name) => save({ name })}
          placeholder="Название цвета"
        />
      </div>

      {/* In stock toggle */}
      <Button
        type="button"
        size="xs"
        disabled={isPending}
        onClick={() => save({ inStock: !color.inStock })}
        className={`text-xs font-mono px-2 py-0.5 rounded-full transition-colors ${
          color.inStock
            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
            : 'bg-amber-500 text-white hover:bg-amber-600'
        }`}
      >
        {color.inStock ? 'В наличии' : 'Под заказ'}
      </Button>

      {/* Delete */}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        disabled={isPending}
        onClick={() => {
          if (confirm('Удалить цвет?')) {
            startTransition(() => deleteMaterialColor(color.id))
          }
        }}
        className="text-muted hover:bg-transparent hover:text-red-500 transition-colors text-sm"
      >
        ✕
      </Button>
    </div>
  )
}

function AddColorForm({ materialId }: { materialId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [hex, setHex] = useState('#ffffff')
  const [isGradient, setIsGradient] = useState(false)
  const [hex2, setHex2] = useState('#000000')
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    if (!name.trim() || !hex.trim()) return
    startTransition(async () => {
      await addMaterialColor(materialId, {
        name: name.trim(),
        hex: hex.trim(),
        ...(isGradient && hex2.trim() ? { hex2: hex2.trim() } : {}),
        inStock: true,
      })
      setName('')
      setHex('#ffffff')
      setHex2('#000000')
      setIsGradient(false)
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs text-accent hover:bg-transparent hover:underline"
      >
        + Добавить цвет
      </Button>
    )
  }

  return (
    <div className="mt-3 flex items-center gap-2 flex-wrap">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название"
        className="border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:border-accent w-28"
      />
      <Input
        value={hex}
        onChange={(e) => setHex(e.target.value)}
        placeholder="#hex"
        className="font-mono border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:border-accent w-24"
      />
      <Input
        type="color"
        value={toColorInputValue(hex)}
        onChange={(e) => setHex(e.target.value)}
        className="h-8 w-8 cursor-pointer rounded p-0"
        aria-label="Выбрать основной цвет"
      />
      {isGradient && (
        <>
          <Input
            value={hex2}
            onChange={(e) => setHex2(e.target.value)}
            placeholder="#hex2"
            className="font-mono border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:border-accent w-24"
          />
          <Input
            type="color"
            value={toColorInputValue(hex2, '#000000')}
            onChange={(e) => setHex2(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded p-0"
            aria-label="Выбрать второй цвет"
          />
        </>
      )}
      <ColorDot hex={hex} hex2={isGradient ? hex2 : undefined} />
      <label className="flex items-center gap-1 text-xs text-muted cursor-pointer select-none">
        <Checkbox
          checked={isGradient}
          onCheckedChange={(checked) => setIsGradient(Boolean(checked))}
          className="cursor-pointer"
        />
        Градиентный
      </label>
      <Button
        type="button"
        size="sm"
        disabled={isPending || !name.trim()}
        onClick={handleAdd}
        className="px-3 py-1 rounded-lg bg-accent text-white text-xs font-medium hover:bg-(--accent-hover) disabled:opacity-40 transition-colors"
      >
        {isPending ? '…' : 'Добавить'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(false)}
        className="text-xs text-muted hover:bg-transparent"
      >
        Отмена
      </Button>
    </div>
  )
}

function MaterialCard({ material }: { material: MaterialWithColors }) {
  const [isPending, startTransition] = useTransition()
  const [colorsOpen, setColorsOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  function save(data: Parameters<typeof updateMaterial>[1]) {
    startTransition(() => updateMaterial(material.id, data))
  }

  const dotColor = material.color || 'var(--muted)'

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-5 py-4 border-b border-border">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={
            material.color
              ? { background: dotColor, boxShadow: `0 0 8px ${dotColor}66` }
              : { background: dotColor }
          }
        />
        <span className="min-w-0 break-words font-black text-lg text-foreground font-display">
          {material.name}
        </span>

        {/* Available toggle */}
        <Button
          type="button"
          size="xs"
          disabled={isPending}
          onClick={() => save({ available: !material.available })}
          className={`ml-auto text-xs font-mono px-2.5 py-0.5 rounded-full transition-colors ${
            material.available
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-slate-400 text-white hover:bg-slate-500'
          }`}
        >
          {material.available ? 'Активен' : 'Скоро'}
        </Button>
      </div>

      {/* Editable fields */}
      <div className="px-4 sm:px-5 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="label-mono mb-1">Описание</p>
          <EditableField
            value={material.description}
            onSave={(description) => save({ description })}
          />
        </div>
        <div>
          <p className="label-mono mb-1">Цена</p>
          <PriceField value={material.price} onSave={(price) => save({ price })} />
        </div>
        <div>
          <p className="label-mono mb-1">Лучше всего для</p>
          <EditableField value={material.best} onSave={(best) => save({ best })} />
        </div>
      </div>

      {/* Details (expandable) */}
      <div className="border-t border-border">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setDetailsOpen((v) => !v)}
          className="w-full px-5 py-3 flex items-center justify-between hover:bg-background transition-colors h-auto rounded-none"
        >
          <span className="label-mono">Подробности</span>
          <span className="text-muted text-sm">{detailsOpen ? '▲' : '▼'}</span>
        </Button>
        {detailsOpen && (
          <div className="px-4 sm:px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <p className="label-mono mb-1">Полное название</p>
              <EditableField
                value={material.fullName}
                onSave={(fullName) => save({ fullName })}
                placeholder="Polylactic Acid"
              />
            </div>
            <div>
              <p className="label-mono mb-1">Цвет акцента</p>
              <ColorPickerField value={material.color} onSave={(color) => save({ color })} />
            </div>
            <div>
              <p className="label-mono mb-1">Темп. предел</p>
              <EditableField
                value={material.tempLimit}
                onSave={(tempLimit) => save({ tempLimit })}
                placeholder="до 60°C"
              />
            </div>
            <div>
              <p className="label-mono mb-1">Прочность</p>
              <EditableField
                value={material.strength}
                onSave={(strength) => save({ strength })}
                placeholder="Средняя"
              />
            </div>
            <div className="sm:col-span-2">
              <p className="label-mono mb-1">Теги для лендинга (до 3)</p>
              <PropsField value={material.props ?? []} onSave={(props) => save({ props })} />
            </div>
            <div className="sm:col-span-2">
              <p className="label-mono mb-1">Развёрнутое описание</p>
              <MultilineField
                value={material.longDesc}
                onSave={(longDesc) => save({ longDesc })}
                placeholder="Текст для popover на форме заказа и карточки на лендинге"
              />
            </div>
          </div>
        )}
      </div>

      {/* Colors (expandable) */}
      <div className="border-t border-border">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setColorsOpen((v) => !v)}
          className="w-full px-5 py-3 flex items-center justify-between hover:bg-background transition-colors h-auto rounded-none"
        >
          <span className="label-mono">Цвета ({material.colors.length})</span>
          <span className="text-muted text-sm">{colorsOpen ? '▲' : '▼'}</span>
        </Button>
        {colorsOpen && (
          <div className="px-4 sm:px-5 pb-4">
            <div>
              {material.colors.map((c) => (
                <ColorRow key={c.id} color={c} materialId={material.id} />
              ))}
            </div>
            <AddColorForm materialId={material.id} />
          </div>
        )}
      </div>
    </div>
  )
}

function AddMaterialForm() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    best: '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleAdd() {
    if (!form.name.trim()) return
    startTransition(async () => {
      await createMaterial({
        ...form,
        price: form.price.trim().replace(',', '.'),
      })
      setForm({ name: '', description: '', price: '', best: '' })
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-border py-4 text-sm text-muted hover:bg-transparent hover:border-(--accent-border) hover:text-accent transition-colors"
      >
        + Добавить материал
      </Button>
    )
  }

  return (
    <div className="rounded-xl border-2 border-accent bg-surface p-5 space-y-4">
      <p className="font-black text-foreground font-display">Новый материал</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label-mono mb-1 block">Название *</label>
          <Input
            autoFocus
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Например: ASA"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="label-mono mb-1 block">Цена за грамм</label>
          <div className="relative">
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="3"
              className="w-full border border-border rounded-lg px-3 py-2 pr-12 text-sm font-mono bg-background text-foreground focus:outline-none focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted font-mono">
              ₽/г
            </span>
          </div>
        </div>
        <div>
          <label className="label-mono mb-1 block">Описание</label>
          <Input
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Гибкий, термостойкий"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="label-mono mb-1 block">Лучше всего для</label>
          <Input
            value={form.best}
            onChange={(e) => set('best', e.target.value)}
            placeholder="Корпуса, детали"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          disabled={isPending || !form.name.trim()}
          onClick={handleAdd}
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-(--accent-hover) disabled:opacity-40 transition-colors"
        >
          {isPending ? 'Создание…' : 'Создать материал'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen(false)}
          className="text-sm text-muted hover:bg-transparent hover:text-foreground transition-colors"
        >
          Отмена
        </Button>
      </div>
    </div>
  )
}

export function MaterialsAdminClient({ materials }: Props) {
  return (
    <div className="space-y-4">
      {materials.map((mat) => (
        <MaterialCard key={mat.id} material={mat} />
      ))}
      <AddMaterialForm />
    </div>
  )
}
