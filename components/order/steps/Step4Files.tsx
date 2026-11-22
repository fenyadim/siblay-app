"use client"

import { useFormContext } from "react-hook-form"
import { useState, useRef } from "react"
import {
  MAX_IMAGE_FILES,
  MAX_IMAGE_SIZE,
  MAX_MODEL_FILES,
  MAX_MODEL_SIZE,
  selectAttachments,
} from "@/lib/attachments"
import { cn, formatFileSize } from "@/lib/utils"
import type { OrderFormData } from "@/lib/validations/order"

const MODEL_FORMATS = [".stl", ".obj", ".3mf", ".step", ".stp"]
const PHOTO_FORMATS = [".jpg", ".jpeg", ".png", ".heic", ".webp"]

export function Step4Files() {
  const { watch, setValue, getValues } = useFormContext<OrderFormData>()
  const hasModel = watch("hasModel") ?? true
  const files = watch("files") ?? []
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const accept = hasModel ? MODEL_FORMATS.join(",") : PHOTO_FORMATS.join(",")
  const maxFiles = hasModel ? MAX_MODEL_FILES : MAX_IMAGE_FILES

  function addFiles(selected: FileList) {
    const result = selectAttachments(getValues("files"), selected, maxFiles, hasModel ? "model" : "image")
    setValue("files", result.files, { shouldValidate: true })
    setFileErrors(result.errors)
  }

  function removeFile(index: number) {
    setValue("files", getValues("files").filter((_, i) => i !== index), { shouldValidate: true })
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-foreground mb-1 font-display">
        Файлы
      </h2>
      <p className="text-sm text-muted mb-5">
        {hasModel ? "Выберите вашу 3D-модель" : "Выберите фотографии или эскизы изделия"}
      </p>

      {/* Toggle */}
      <div className="flex items-center gap-3 mb-6 p-3 rounded-xl border border-border bg-surface">
        <button
          type="button"
          onClick={() => {
            setValue("hasModel", !hasModel)
            setValue("files", [], { shouldValidate: true })
            setFileErrors([])
          }}
          className={cn(
            "relative w-11 h-6 rounded-full overflow-hidden transition-colors flex-shrink-0",
            !hasModel ? "bg-accent" : "bg-border",
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
          <p className="text-sm font-medium text-foreground">У меня нет 3D-модели</p>
          <p className="text-xs text-muted">Загрузите фото/эскизы, мы создадим модель (+50% к цене)</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={(event) => {
          event.preventDefault()
          addFiles(event.dataTransfer.files)
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors border-border bg-surface hover:border-(--accent-border) hover:bg-background"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ""
          }}
        />
        <div className="text-3xl mb-3 text-muted">
          📎
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Перетащите файлы или нажмите
        </p>
        <p className="text-xs text-muted">
          {hasModel
            ? `${MODEL_FORMATS.join(", ")} · до ${formatFileSize(MAX_MODEL_SIZE)}`
            : `${PHOTO_FORMATS.join(", ")} · до ${formatFileSize(MAX_IMAGE_SIZE)} · до ${maxFiles} файлов`}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface"
            >
              <div className="w-8 h-8 rounded-lg bg-(--accent-subtle) flex items-center justify-center text-xs font-mono text-accent shrink-0">
                {f.name.split(".").pop()?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                <p className="text-xs text-muted">{formatFileSize(f.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Убрать файл ${f.name}`}
                className="text-muted hover:text-destructive transition-colors"
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
      {fileErrors.map((e, i) => (
        <p key={i} className="mt-2 text-xs text-destructive">{e}</p>
      ))}
    </div>
  )
}
