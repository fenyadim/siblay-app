"use client"

import { useState, useTransition, useRef, useCallback } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { portfolioSchema, PORTFOLIO_CATEGORIES, type PortfolioFormData } from "@/lib/validations/portfolio"
import { createPortfolioItem, updatePortfolioItem, deletePortfolioItem } from "@/actions/portfolio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

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

/* ── Image Upload Component ───────────────────────────────────────────── */

interface UploadingFile {
  id: string
  name: string
  progress: number
  url?: string
  error?: string
}

interface ParamRow {
  id: string
  key: string
  value: string
}

const PARAMETER_OPTIONS = [
  "Слой",
  "Заполнение",
  "Масштаб",
  "Поддержки",
  "Высота",
  "Ширина",
  "Длина",
  "Диаметр",
  "Модуль",
] as const

function ImageUploader({
  images,
  onChange,
}: {
  images: string[]
  onChange: (urls: string[]) => void
}) {
  const [uploading, setUploading] = useState<UploadingFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const id = Math.random().toString(36).slice(2)
    setUploading((prev) => [...prev, { id, name: file.name, progress: 30 }])

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "portfolio")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Ошибка загрузки")
      }

      const { fileUrl } = await res.json()

      setUploading((prev) =>
        prev.map((f) => (f.id === id ? { ...f, progress: 100, url: fileUrl } : f)),
      )

      setTimeout(() => {
        setUploading((prev) => prev.filter((f) => f.id !== id))
      }, 500)

      return fileUrl
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка"
      setUploading((prev) =>
        prev.map((f) => (f.id === id ? { ...f, error: message } : f)),
      )
      return null
    }
  }, [])

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      )
      if (imageFiles.length === 0) return

      const results = await Promise.all(imageFiles.map(uploadFile))
      const newUrls = results.filter((u): u is string => u !== null)
      if (newUrls.length > 0) {
        onChange([...images, ...newUrls])
      }
    },
    [images, onChange, uploadFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const removeUploadError = (id: string) => {
    setUploading((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div>
      <label className="block text-xs text-muted mb-1">
        Фотографии *
      </label>

      {/* Current images */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <img
                src={url}
                alt=""
                className="w-20 h-20 rounded-xl object-cover border border-border"
              />
              <Button
                type="button"
                size="icon-xs"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </Button>
              {i === 0 && (
                <span className="absolute bottom-0.5 left-0.5 right-0.5 text-center text-[9px] font-mono bg-black/50 text-white rounded-b-lg py-0.5">
                  обложка
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploading files */}
      {uploading.length > 0 && (
        <div className="space-y-2 mb-3">
          {uploading.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <span className="text-foreground truncate flex-1">
                {f.name}
              </span>
              {f.error ? (
                <>
                  <span className="text-xs text-destructive">{f.error}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => removeUploadError(f.id)}
                    className="text-xs text-muted hover:bg-transparent hover:text-foreground"
                  >
                    ×
                  </Button>
                </>
              ) : (
                <div className="w-20 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
          dragOver
            ? "border-accent bg-(--accent-subtle)"
            : "border-border bg-background hover:border-(--accent-border)",
        )}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-xs text-muted">
          Перетащите фото или{" "}
          <span className="text-accent font-medium">выберите файлы</span>
        </p>
        <p className="text-[10px] text-(--placeholder)">
          JPG, PNG, WEBP, HEIC
        </p>
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
            e.target.value = ""
          }}
        />
      </div>
    </div>
  )
}

/* ── Portfolio Form ───────────────────────────────────────────────────── */

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema) as Resolver<PortfolioFormData>,
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      category: defaultValues?.category,
      material: defaultValues?.material ?? "",
      published: true,
      images: [],
      ...(typeof defaultValues?.published === "boolean"
        ? { published: defaultValues.published }
        : {}),
      ...(Array.isArray(defaultValues?.images)
        ? { images: defaultValues.images }
        : {}),
    },
  })

  const images = watch("images") ?? []
  const category = watch("category")
  const published = watch("published")
  const [paramRows, setParamRows] = useState<ParamRow[]>(() => {
    if (!defaultValues?.params) return []
    return Object.entries(defaultValues.params)
      .filter(([k, v]) => Boolean(k) && Boolean(v))
      .map(([key, value], index) => ({
        id: `${index}-${Math.random().toString(36).slice(2)}`,
        key,
        value,
      }))
  })

  const addParamRow = () => {
    setParamRows((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), key: PARAMETER_OPTIONS[0], value: "" },
    ])
  }

  const updateParamRow = (id: string, patch: Partial<ParamRow>) => {
    setParamRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
  }

  const removeParamRow = (id: string) => {
    setParamRows((prev) => prev.filter((row) => row.id !== id))
  }

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const params = paramRows.reduce<Record<string, string>>((acc, row) => {
          const key = row.key.trim()
          const value = row.value.trim()
          if (!key || !value) return acc
          acc[key] = value
          return acc
        }, {})

        onSubmit({
          ...data,
          params: Object.keys(params).length > 0 ? params : undefined,
        })
      })}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted mb-1">Название *</label>
          <Input
            {...register("title")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">Категория *</label>
          <Select
            value={category ?? undefined}
            onValueChange={(value) =>
              setValue("category", value as PortfolioFormData["category"], {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="w-full rounded-lg border-border bg-background text-sm text-foreground">
              <SelectValue placeholder="Выберите…" />
            </SelectTrigger>
            <SelectContent>
            {PORTFOLIO_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">Материал *</label>
          <Input
            {...register("material")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {errors.material && <p className="text-xs text-red-500 mt-1">{errors.material.message}</p>}
        </div>

        <div className="flex items-center gap-2 pt-5">
          <Checkbox
            id="published"
            checked={Boolean(published)}
            onCheckedChange={(checked) =>
              setValue("published", Boolean(checked), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          <label htmlFor="published" className="text-sm text-foreground">
            Опубликовано
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted mb-1">Описание</label>
        <Textarea
          {...register("description")}
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-muted">Параметры детали</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addParamRow}
            className="text-xs text-accent hover:bg-transparent hover:underline"
          >
            + Добавить параметр
          </Button>
        </div>

        {paramRows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted">
            Параметры не добавлены
          </div>
        ) : (
          <div className="space-y-2">
            {paramRows.map((row) => (
              <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Select
                  value={row.key}
                  onValueChange={(value) => updateParamRow(row.id, { key: value })}
                >
                  <SelectTrigger className="w-full rounded-lg border-border bg-background text-sm text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set([...PARAMETER_OPTIONS, row.key])).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={row.value}
                  onChange={(e) => updateParamRow(row.id, { value: e.target.value })}
                  placeholder="Значение (например: 0.1 мм)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeParamRow(row.id)}
                  className="px-3 rounded-lg border border-border text-sm text-muted hover:text-red-500"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image uploader */}
      <ImageUploader
        images={Array.isArray(images) ? images : []}
        onChange={(urls) => setValue("images", urls, { shouldValidate: true })}
      />
      {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images.message}</p>}

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-(--accent-hover) transition-colors disabled:opacity-50"
        >
          {isPending ? "Сохранение…" : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-border text-sm text-muted hover:text-foreground transition-colors"
        >
          Отмена
        </Button>
      </div>
    </form>
  )
}

/* ── Admin Client ─────────────────────────────────────────────────────── */

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
            <Button
              type="button"
              onClick={() => { setMode("create"); setError(null) }}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-(--accent-hover) transition-colors"
            >
              + Добавить работу
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
              Нет работ в портфолио
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background">
                      {["Название", "Категория", "Материал", "Фото", "Статус", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 label-mono font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-background transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.images[0] && (
                              <img
                                src={item.images[0]}
                                alt=""
                                className="w-10 h-10 rounded-md object-cover border border-border"
                              />
                            )}
                            <span className="font-medium text-foreground">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {categoryLabels[item.category] ?? item.category}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                          {item.material}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-muted">
                            {item.images.length}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={
                              item.published
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-surface text-muted border border-border"
                            }
                          >
                            {item.published ? "Опубликовано" : "Скрыто"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingId(item.id)
                                setMode("edit")
                                setError(null)
                              }}
                              className="text-xs text-accent hover:bg-transparent hover:underline"
                            >
                              Изменить
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              disabled={isPending}
                              className="text-xs text-red-500 hover:bg-transparent hover:underline disabled:opacity-50"
                            >
                              Удалить
                            </Button>
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
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2
            className="text-lg font-bold text-foreground mb-5 font-display"
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
