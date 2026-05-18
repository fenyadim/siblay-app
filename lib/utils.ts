import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Formatters ───────────────────────────────────────────────────────
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

// ── Material price ───────────────────────────────────────────────────
// Stored value is the bare number as a string ("2", "2.5"). Older records
// may contain pre-formatted strings ("от 2 ₽/г") — extract the first number
// so display stays consistent without a migration.
export function parseMaterialPrice(stored: string): string {
  const match = stored.match(/[\d]+([.,][\d]+)?/)
  return match ? match[0].replace(",", ".") : ""
}

export function formatMaterialPrice(stored: string): string {
  const n = parseMaterialPrice(stored)
  return n ? `от ${n} ₽/г` : stored
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

// ── Order status labels ──────────────────────────────────────────────
export const ORDER_STATUS_LABELS: Record<string, string> = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  READY: "Готов",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500 text-white",
  IN_PROGRESS: "bg-amber-500 text-white",
  READY: "bg-emerald-500 text-white",
  DELIVERED: "bg-slate-600 text-white",
  CANCELLED: "bg-red-500 text-white",
}

// ── Quote (заявка) labels ───────────────────────────────────────────
export const QUOTE_TYPE_LABELS: Record<string, string> = {
  MODELING: "3D-моделирование",
  SCANNING: "3D-сканирование",
}

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  NEW: "Новая",
  IN_REVIEW: "Изучаем",
  QUOTED: "Цена озвучена",
  ACCEPTED: "Принято",
  REJECTED: "Отклонена",
}

export const QUOTE_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500 text-white",
  IN_REVIEW: "bg-amber-500 text-white",
  QUOTED: "bg-purple-500 text-white",
  ACCEPTED: "bg-emerald-500 text-white",
  REJECTED: "bg-red-500 text-white",
}

export const MODELING_SOURCE_LABELS: Record<string, string> = {
  sketch: "По эскизу / описанию",
  photo: "По фотографиям",
  drawing: "По чертежу (CAD/CAM)",
  revise: "Доработка существующей модели",
}

export const SCAN_LOCATION_LABELS: Record<string, string> = {
  pickup: "Заберём у клиента",
  bring: "Клиент привезёт",
  onsite: "Выезд специалиста",
}
