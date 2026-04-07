"use client"

import { useState, useTransition } from "react"
import { createMaterial, updateMaterial, updateMaterialColor, addMaterialColor, deleteMaterialColor } from "@/actions/materials"
import type { MaterialWithColors } from "@/actions/materials"

interface Props {
  materials: MaterialWithColors[]
}

function ColorDot({ hex, hex2 }: { hex: string; hex2?: string | null }) {
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border border-black/10 shrink-0"
      style={{
        background: hex2
          ? `linear-gradient(135deg, ${hex} 50%, ${hex2} 50%)`
          : hex,
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
      <button
        onClick={() => { setDraft(value); setEditing(true) }}
        className={`text-left hover:text-accent transition-colors ${mono ? "font-mono" : ""}`}
      >
        {value || <span className="text-muted italic">{placeholder ?? "—"}</span>}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { onSave(draft); setEditing(false) }
          if (e.key === "Escape") { setEditing(false) }
        }}
        className={`border border-accent rounded px-2 py-0.5 text-sm bg-background text-foreground focus:outline-none w-full min-w-0 ${mono ? "font-mono" : ""}`}
      />
      <button
        onClick={() => { onSave(draft); setEditing(false) }}
        className="text-accent text-xs font-medium whitespace-nowrap"
      >
        ✓
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-muted text-xs"
      >
        ✕
      </button>
    </div>
  )
}

function ColorRow({
  color,
  materialId,
}: {
  color: MaterialWithColors["colors"][number]
  materialId: string
}) {
  const [isPending, startTransition] = useTransition()
  const [editingHex, setEditingHex] = useState(false)
  const [hexDraft, setHexDraft] = useState(color.hex)
  const [showHex2, setShowHex2] = useState(!!color.hex2)
  const [editingHex2, setEditingHex2] = useState(false)
  const [hex2Draft, setHex2Draft] = useState(color.hex2 ?? "")

  function save(data: Parameters<typeof updateMaterialColor>[1]) {
    startTransition(() => updateMaterialColor(color.id, data))
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0 flex-wrap">
      {/* Color dot + hex editor */}
      <div className="flex items-center gap-1.5">
        <ColorDot hex={color.hex} hex2={color.hex2} />
        {editingHex ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={hexDraft}
              onChange={(e) => setHexDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { save({ hex: hexDraft }); setEditingHex(false) }
                if (e.key === "Escape") setEditingHex(false)
              }}
              className="font-mono text-xs border border-accent rounded px-1.5 py-0.5 bg-background text-foreground focus:outline-none w-24"
            />
            <button onClick={() => { save({ hex: hexDraft }); setEditingHex(false) }} className="text-accent text-xs">✓</button>
            <button onClick={() => setEditingHex(false)} className="text-muted text-xs">✕</button>
          </div>
        ) : (
          <button onClick={() => { setHexDraft(color.hex); setEditingHex(true) }} className="font-mono text-xs text-muted hover:text-accent transition-colors">
            {color.hex}
          </button>
        )}
      </div>

      {/* Hex2 editor */}
      <div className="flex items-center gap-1.5">
        {showHex2 ? (
          editingHex2 ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={hex2Draft}
                onChange={(e) => setHex2Draft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { save({ hex2: hex2Draft || null }); setEditingHex2(false) }
                  if (e.key === "Escape") setEditingHex2(false)
                }}
                className="font-mono text-xs border border-accent rounded px-1.5 py-0.5 bg-background text-foreground focus:outline-none w-24"
                placeholder="#hex2"
              />
              <button onClick={() => { save({ hex2: hex2Draft || null }); setEditingHex2(false) }} className="text-accent text-xs">✓</button>
              <button onClick={() => { setShowHex2(false); save({ hex2: null }) }} className="text-red-400 text-xs" title="Убрать цвет 2">✕</button>
            </div>
          ) : (
            <button
              onClick={() => { setHex2Draft(color.hex2 ?? ""); setEditingHex2(true) }}
              className="font-mono text-xs text-muted hover:text-accent transition-colors"
            >
              {color.hex2 ?? <span className="italic opacity-60">цвет 2</span>}
            </button>
          )
        ) : (
          <button
            onClick={() => setShowHex2(true)}
            className="text-xs text-accent opacity-60 hover:opacity-100 transition-opacity"
          >
            ＋ цвет 2
          </button>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <EditableField
          value={color.name}
          onSave={(name) => save({ name })}
          placeholder="Название цвета"
        />
      </div>

      {/* In stock toggle */}
      <button
        type="button"
        disabled={isPending}
        onClick={() => save({ inStock: !color.inStock })}
        className={`text-xs font-mono px-2 py-0.5 rounded-full transition-colors ${
          color.inStock
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "bg-amber-500 text-white hover:bg-amber-600"
        }`}
      >
        {color.inStock ? "В наличии" : "Под заказ"}
      </button>

      {/* Delete */}
      <button
        disabled={isPending}
        onClick={() => {
          if (confirm("Удалить цвет?")) {
            startTransition(() => deleteMaterialColor(color.id))
          }
        }}
        className="text-muted hover:text-red-500 transition-colors text-sm"
      >
        ✕
      </button>
    </div>
  )
}

function AddColorForm({ materialId }: { materialId: string }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [hex, setHex] = useState("#ffffff")
  const [isGradient, setIsGradient] = useState(false)
  const [hex2, setHex2] = useState("#000000")
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
      setName("")
      setHex("#ffffff")
      setHex2("#000000")
      setIsGradient(false)
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-xs text-accent hover:underline"
      >
        + Добавить цвет
      </button>
    )
  }

  return (
    <div className="mt-3 flex items-center gap-2 flex-wrap">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название"
        className="border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:border-accent w-28"
      />
      <input
        value={hex}
        onChange={(e) => setHex(e.target.value)}
        placeholder="#hex"
        className="font-mono border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:border-accent w-24"
      />
      {isGradient && (
        <input
          value={hex2}
          onChange={(e) => setHex2(e.target.value)}
          placeholder="#hex2"
          className="font-mono border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:border-accent w-24"
        />
      )}
      <ColorDot hex={hex} hex2={isGradient ? hex2 : undefined} />
      <label className="flex items-center gap-1 text-xs text-muted cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isGradient}
          onChange={(e) => setIsGradient(e.target.checked)}
          className="cursor-pointer"
        />
        Градиентный
      </label>
      <button
        disabled={isPending || !name.trim()}
        onClick={handleAdd}
        className="px-3 py-1 rounded-lg bg-accent text-white text-xs font-medium hover:bg-(--accent-hover) disabled:opacity-40 transition-colors"
      >
        {isPending ? "…" : "Добавить"}
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-muted">Отмена</button>
    </div>
  )
}

function MaterialCard({ material }: { material: MaterialWithColors }) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  function save(data: Parameters<typeof updateMaterial>[1]) {
    startTransition(() => updateMaterial(material.id, data))
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ background: material.color, boxShadow: `0 0 8px ${material.color}66` }}
        />
        <span className="font-black text-lg text-foreground" style={{ fontFamily: "Syne, sans-serif" }}>
          {material.name}
        </span>

        {/* Available toggle */}
        <button
          type="button"
          disabled={isPending}
          onClick={() => save({ available: !material.available })}
          className={`ml-auto text-xs font-mono px-2.5 py-0.5 rounded-full transition-colors ${
            material.available
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-slate-400 text-white hover:bg-slate-500"
          }`}
        >
          {material.available ? "Активен" : "Скоро"}
        </button>

        {/* Expand/collapse colors */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-muted hover:text-foreground transition-colors text-sm"
        >
          {open ? "▲" : "▼"}
        </button>
      </div>

      {/* Editable fields */}
      <div className="px-5 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="label-mono mb-1">Описание</p>
          <EditableField value={material.description} onSave={(description) => save({ description })} />
        </div>
        <div>
          <p className="label-mono mb-1">Цена</p>
          <EditableField value={material.price} onSave={(price) => save({ price })} mono />
        </div>
        <div>
          <p className="label-mono mb-1">Лучше всего для</p>
          <EditableField value={material.best} onSave={(best) => save({ best })} />
        </div>
      </div>

      {/* Colors (expandable) */}
      {open && (
        <div className="px-5 pb-4 border-t border-border pt-3">
          <p className="label-mono mb-2">Цвета ({material.colors.length})</p>
          <div>
            {material.colors.map((c) => (
              <ColorRow key={c.id} color={c} materialId={material.id} />
            ))}
          </div>
          <AddColorForm materialId={material.id} />
        </div>
      )}
    </div>
  )
}

function AddMaterialForm() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: "", description: "", price: "", color: "#3b82f6", best: "" })

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleAdd() {
    if (!form.name.trim()) return
    startTransition(async () => {
      await createMaterial(form)
      setForm({ name: "", description: "", price: "", color: "#3b82f6", best: "" })
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-border py-4 text-sm text-muted hover:border-(--accent-border) hover:text-accent transition-colors"
      >
        + Добавить материал
      </button>
    )
  }

  return (
    <div className="rounded-xl border-2 border-accent bg-surface p-5 space-y-4">
      <p className="font-black text-foreground" style={{ fontFamily: "Syne, sans-serif" }}>
        Новый материал
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label-mono mb-1 block">Название *</label>
          <input
            autoFocus
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Например: ASA"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="label-mono mb-1 block">Цена</label>
          <input
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="от 3 ₽/г"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm font-mono bg-background text-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="label-mono mb-1 block">Описание</label>
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Гибкий, термостойкий"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="label-mono mb-1 block">Лучше всего для</label>
          <input
            value={form.best}
            onChange={(e) => set("best", e.target.value)}
            placeholder="Корпуса, детали"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="label-mono">Цвет точки</label>
        <input
          type="color"
          value={form.color}
          onChange={(e) => set("color", e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-border"
        />
        <span className="font-mono text-xs text-muted">{form.color}</span>
        <div className="w-4 h-4 rounded-full border border-black/10" style={{ background: form.color }} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          disabled={isPending || !form.name.trim()}
          onClick={handleAdd}
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-(--accent-hover) disabled:opacity-40 transition-colors"
        >
          {isPending ? "Создание…" : "Создать материал"}
        </button>
        <button onClick={() => setOpen(false)} className="text-sm text-muted hover:text-foreground transition-colors">
          Отмена
        </button>
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
