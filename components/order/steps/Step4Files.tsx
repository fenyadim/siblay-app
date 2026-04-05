"use client"

import { useFormContext } from "react-hook-form"
import { useState, useRef } from "react"
import { cn, formatFileSize } from "@/lib/utils"
import type { OrderFormData } from "@/lib/validations/order"

const MODEL_FORMATS = [".stl", ".obj", ".3mf", ".step", ".stp"]
const PHOTO_FORMATS = [".jpg", ".jpeg", ".png", ".heic", ".webp"]
const MODEL_MAX_SIZE = 100 * 1024 * 1024
const PHOTO_MAX_SIZE = 20 * 1024 * 1024

interface UploadedFile {
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}

export function Step4Files() {
  const { watch, setValue, formState: { errors } } = useFormContext<OrderFormData>()
  const hasModel = watch("hasModel") ?? true
  const files = (watch("files") ?? []) as UploadedFile[]

  const [uploading, setUploading] = useState<Record<string, number>>({})
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = hasModel ? MODEL_FORMATS.join(",") : PHOTO_FORMATS.join(",")
  const maxSize = hasModel ? MODEL_MAX_SIZE : PHOTO_MAX_SIZE
  const maxFiles = hasModel ? 3 : 10

  async function uploadFile(file: File) {
    if (file.size > maxSize) {
      setUploadErrors((prev) => [...prev, `${file.name}: файл слишком большой`])
      return
    }
    if (files.length >= maxFiles) {
      setUploadErrors((prev) => [...prev, `Максимум ${maxFiles} файлов`])
      return
    }

    setUploading((prev) => ({ ...prev, [file.name]: 0 }))

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      })
      const { url, fileUrl } = await res.json()

      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })

      const newFile: UploadedFile = {
        fileName: file.name,
        fileUrl,
        fileType: file.type,
        fileSize: file.size,
      }

      setValue("files", [...files, newFile], { shouldValidate: true })
    } catch {
      setUploadErrors((prev) => [...prev, `${file.name}: ошибка загрузки`])
    } finally {
      setUploading((prev) => {
        const next = { ...prev }
        delete next[file.name]
        return next
      })
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files)
    dropped.forEach(uploadFile)
  }

  function removeFile(idx: number) {
    const next = files.filter((_, i) => i !== idx)
    setValue("files", next, { shouldValidate: true })
  }

  const isUploading = Object.keys(uploading).length > 0

  return (
    <div>
      <h2 className="text-2xl font-black text-[var(--foreground)] mb-1" style={{ fontFamily: "Syne, sans-serif" }}>
        Загрузка файлов
      </h2>
      <p className="text-sm text-[var(--muted)] mb-5">
        {hasModel ? "Загрузите вашу 3D-модель" : "Загрузите фотографии или эскизы изделия"}
      </p>

      {/* Toggle */}
      <div className="flex items-center gap-3 mb-6 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <button
          type="button"
          onClick={() => {
            setValue("hasModel", !hasModel)
            setValue("files", [])
          }}
          className={cn(
            "relative w-11 h-6 rounded-full overflow-hidden transition-colors flex-shrink-0",
            !hasModel ? "bg-[var(--accent)]" : "bg-[var(--border)]",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
              !hasModel ? "translate-x-5" : "translate-x-0",
            )}
          />
        </button>
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">У меня нет 3D-модели</p>
          <p className="text-xs text-[var(--muted)]">Загрузите фото/эскизы, мы создадим модель (+50% к цене)</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors",
          isUploading
            ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent-border)] hover:bg-[var(--background)]",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => Array.from(e.target.files ?? []).forEach(uploadFile)}
        />
        <div className="text-3xl mb-3 text-[var(--muted)]">
          {isUploading ? "⏳" : "📎"}
        </div>
        <p className="text-sm font-medium text-[var(--foreground)] mb-1">
          {isUploading ? "Загрузка..." : "Перетащите файлы или нажмите"}
        </p>
        <p className="text-xs text-[var(--muted)]">
          {hasModel
            ? `${MODEL_FORMATS.join(", ")} · до ${formatFileSize(MODEL_MAX_SIZE)}`
            : `${PHOTO_FORMATS.join(", ")} · до ${formatFileSize(PHOTO_MAX_SIZE)} · до ${maxFiles} файлов`}
        </p>
      </div>

      {/* Uploading indicators */}
      {Object.keys(uploading).map((name) => (
        <div key={name} className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]">
          <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin shrink-0" />
          {name}
        </div>
      ))}

      {/* Uploaded files */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center text-xs font-mono text-[var(--accent)] shrink-0">
                {f.fileName.split(".").pop()?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{f.fileName}</p>
                <p className="text-xs text-[var(--muted)]">{formatFileSize(f.fileSize)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-[var(--muted)] hover:text-[var(--error)] transition-colors"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {uploadErrors.map((e, i) => (
        <p key={i} className="mt-2 text-xs text-[var(--error)]">{e}</p>
      ))}
    </div>
  )
}
