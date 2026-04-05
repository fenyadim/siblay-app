"use client"

import { useState, useTransition } from "react"
import { createMaterial, updateMaterial, updateMaterialColor, addMaterialColor, deleteMaterialColor } from "@/actions/materials"
import type { MaterialWithColors } from "@/actions/materials"

interface Props {
  materials: MaterialWithColors[]
}

function ColorDot({ hex }: { hex: string }) {
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border border-black/10 shrink-0"
      style={{ background: hex }}
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
        className={`text-left hover:text-[var(--accent)] transition-colors ${mono ? "font-mono" : ""}`}
      >
        {value || <span className="text-[var(--muted)] italic">{placeholder ?? "—"}</span>}
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
        className={`border border-[var(--accent)] rounded px-2 py-0.5 text-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none w-full min-w-0 ${mono ? "font-mono" : ""}`}
      />
      <button
        onClick={() => { onSave(draft); setEditing(false) }}
        className="text-[var(--accent)] text-xs font-medium whitespace-nowrap"
      >
        ✓
      </button>
      <button
        onClick={() => setEditing(false)}
        className="text-[var(--muted)] text-xs"
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

  function save(data: Parameters<typeof updateMaterialColor>[1]) {
    startTransition(() => updateMaterialColor(color.id, data))
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
      {/* Color dot + hex editor */}
      <div className="flex items-center gap-1.5">
        <ColorDot hex={color.hex} />
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
              className="font-mono text-xs border border-[var(--accent)] rounded px-1.5 py-0.5 bg-[var(--background)] text-[var(--foreground)] focus:outline-none w-24"
            />
            <button onClick={() => { save({ hex: hexDraft }); setEditingHex(false) }} className="text-[var(--accent)] text-xs">✓</button>
            <button onClick={() => setEditingHex(false)} className="text-[var(--muted)] text-xs">✕</button>
          </div>
        ) : (
          <button onClick={() => { setHexDraft(color.hex); setEditingHex(true) }} className="font-mono text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
            {color.hex}
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
        className="text-[var(--muted)] hover:text-red-500 transition-colors text-sm"
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
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    if (!name.trim() || !hex.trim()) return
    startTransition(async () => {
      await addMaterialColor(materialId, { name: name.trim(), hex: hex.trim(), inStock: true })
      setName("")
      setHex("#ffffff")
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-xs text-[var(--accent)] hover:underline"
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
        className="border border-[var(--border)] rounded px-2 py-1 text-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] w-28"
      />
      <input
        value={hex}
        onChange={(e) => setHex(e.target.value)}
        placeholder="#hex"
        className="font-mono border border-[var(--border)] rounded px-2 py-1 text-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] w-24"
      />
      <ColorDot hex={hex} />
      <button
        disabled={isPending || !name.trim()}
        onClick={handleAdd}
        className="px-3 py-1 rounded-lg bg-[var(--accent)] text-white text-xs font-medium hover:bg-[var(--accent-hover)] disabled:opacity-40 transition-colors"
      >
        {isPending ? "…" : "Добавить"}
      </button>
      <button onClick={() => setOpen(false)} className="text-xs text-[var(--muted)]">Отмена</button>
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ background: material.color, boxShadow: `0 0 8px ${material.color}66` }}
        />
        <span className="font-black text-lg text-[var(--foreground)]" style={{ fontFamily: "Syne, sans-serif" }}>
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
          className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
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
        <div className="px-5 pb-4 border-t border-[var(--border)] pt-3">
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
        className="w-full rounded-xl border-2 border-dashed border-[var(--border)] py-4 text-sm text-[var(--muted)] hover:border-[var(--accent-border)] hover:text-[var(--accent)] transition-colors"
      >
        + Добавить материал
      </button>
    )
  }

  return (
    <div className="rounded-xl border-2 border-[var(--accent)] bg-[var(--surface)] p-5 space-y-4">
      <p className="font-black text-[var(--foreground)]" style={{ fontFamily: "Syne, sans-serif" }}>
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
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="label-mono mb-1 block">Цена</label>
          <input
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="от 3 ₽/г"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="label-mono mb-1 block">Описание</label>
          <input
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Гибкий, термостойкий"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label className="label-mono mb-1 block">Лучше всего для</label>
          <input
            value={form.best}
            onChange={(e) => set("best", e.target.value)}
            placeholder="Корпуса, детали"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="label-mono">Цвет точки</label>
        <input
          type="color"
          value={form.color}
          onChange={(e) => set("color", e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-[var(--border)]"
        />
        <span className="font-mono text-xs text-[var(--muted)]">{form.color}</span>
        <div className="w-4 h-4 rounded-full border border-black/10" style={{ background: form.color }} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          disabled={isPending || !form.name.trim()}
          onClick={handleAdd}
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] disabled:opacity-40 transition-colors"
        >
          {isPending ? "Создание…" : "Создать материал"}
        </button>
        <button onClick={() => setOpen(false)} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
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
