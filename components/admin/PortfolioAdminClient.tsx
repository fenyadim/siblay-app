"use client"

import { useState, useTransition } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { portfolioSchema, PORTFOLIO_CATEGORIES, type PortfolioFormData } from "@/lib/validations/portfolio"
import { createPortfolioItem, updatePortfolioItem, deletePortfolioItem } from "@/actions/portfolio"
import { Badge } from "@/components/ui/badge"

interface PortfolioItem {
  id: string
  title: string
  description?: string
  category: string
  material: string
  images: string[]
  params?: Record<string, string>
  published: boolean
  createdAt: Date
}

interface Props {
  items: PortfolioItem[]
  categoryLabels: Record<string, string>
}

function PortfolioForm({
  defaultValues,
  onSubmit,
  onCancel,
  isPending,
}: {
  defaultValues?: Partial<PortfolioFormData>
  onSubmit: (data: PortfolioFormData) => void
  onCancel: () => void
  isPending: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema) as Resolver<PortfolioFormData>,
    defaultValues: {
      published: true,
      images: [],
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Название *</label>
          <input
            {...register("title")}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Категория *</label>
          <select
            {...register("category")}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="">Выберите…</option>
            {PORTFOLIO_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-xs text-[var(--muted)] mb-1">Материал *</label>
          <input
            {...register("material")}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          {errors.material && <p className="text-xs text-red-500 mt-1">{errors.material.message}</p>}
        </div>

        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id="published"
            {...register("published")}
            className="rounded border-[var(--border)] accent-[var(--accent)]"
          />
          <label htmlFor="published" className="text-sm text-[var(--foreground)]">
            Опубликовано
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">Описание</label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-[var(--muted)] mb-1">
          URL изображений * (по одному на строке)
        </label>
        <textarea
          {...register("images", {
            setValueAs: (v: string) =>
              typeof v === "string"
                ? v
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : v,
          })}
          rows={3}
          placeholder="https://…"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
        />
        {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images.message}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {isPending ? "Сохранение…" : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  )
}

export function PortfolioAdminClient({ items: initialItems, categoryLabels }: Props) {
  const [items, setItems] = useState(initialItems)
  const [mode, setMode] = useState<"list" | "create" | "edit">("list")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const editingItem = items.find((i) => i.id === editingId)

  function handleCreate(data: PortfolioFormData) {
    setError(null)
    startTransition(async () => {
      const result = await createPortfolioItem(data)
      if ("error" in result) {
        setError(result.error ?? "Неизвестная ошибка")
      } else {
        setItems((prev) => [
          {
            ...result.item,
            description: result.item.description ?? undefined,
            params: result.item.params as Record<string, string> | undefined,
          },
          ...prev,
        ])
        setMode("list")
      }
    })
  }

  function handleUpdate(data: PortfolioFormData) {
    if (!editingId) return
    setError(null)
    startTransition(async () => {
      const result = await updatePortfolioItem(editingId, data)
      if ("error" in result) {
        setError(result.error ?? "Неизвестная ошибка")
      } else {
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? {
                  ...result.item,
                  description: result.item.description ?? undefined,
                  params: result.item.params as Record<string, string> | undefined,
                }
              : item,
          ),
        )
        setMode("list")
        setEditingId(null)
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm("Удалить элемент?")) return
    startTransition(async () => {
      await deletePortfolioItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    })
  }

  return (
    <div>
      {mode === "list" && (
        <>
          <div className="mb-4">
            <button
              onClick={() => { setMode("create"); setError(null) }}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              + Добавить работу
            </button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--muted)]">
              Нет работ в портфолио
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--background)]">
                      {["Название", "Категория", "Материал", "Статус", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 label-mono font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-[var(--background)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.images[0] && (
                              <img
                                src={item.images[0]}
                                alt=""
                                className="w-10 h-10 rounded-md object-cover border border-[var(--border)]"
                              />
                            )}
                            <span className="font-medium text-[var(--foreground)]">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--muted)]">
                          {categoryLabels[item.category] ?? item.category}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[var(--foreground)]">
                          {item.material}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              item.published
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]"
                            }
                          >
                            {item.published ? "Опубликовано" : "Скрыто"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setEditingId(item.id)
                                setMode("edit")
                                setError(null)
                              }}
                              className="text-xs text-[var(--accent)] hover:underline"
                            >
                              Изменить
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={isPending}
                              className="text-xs text-red-500 hover:underline disabled:opacity-50"
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {(mode === "create" || mode === "edit") && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2
            className="text-lg font-bold text-[var(--foreground)] mb-5"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {mode === "create" ? "Новая работа" : "Редактировать работу"}
          </h2>

          {error && (
            <p className="text-sm text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </p>
          )}

          <PortfolioForm
            defaultValues={
              editingItem
                ? {
                    title: editingItem.title,
                    description: editingItem.description,
                    category: editingItem.category as PortfolioFormData["category"],
                    material: editingItem.material,
                    images: editingItem.images,
                    params: editingItem.params,
                    published: editingItem.published,
                  }
                : undefined
            }
            onSubmit={mode === "create" ? handleCreate : handleUpdate}
            onCancel={() => {
              setMode("list")
              setEditingId(null)
              setError(null)
            }}
            isPending={isPending}
          />
        </div>
      )}
    </div>
  )
}
