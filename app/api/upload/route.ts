import { NextRequest, NextResponse } from "next/server"
import { getPresignedUploadUrl, getS3Url } from "@/lib/s3"
import { nanoid } from "nanoid"

// ── Rate limiting (in-memory, per IP) ────────────────────────────────────────
// Max 20 presigned URL requests per IP per hour
const RATE_LIMIT = 20
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// ── Allowed content types ─────────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = new Set([
  "stl", "obj", "3mf", "step", "stp",     // 3D models
  "jpg", "jpeg", "png", "webp", "heic",    // Photos
])

const ALLOWED_MIME_PREFIXES = [
  "image/",
  "model/",
  "application/octet-stream",
  "application/x-octet-stream",
  "application/sla",
  "application/vnd.ms-pki.stl",
  "application/3mf",
]

function isAllowedFile(fileName: string, contentType: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  if (!ALLOWED_EXTENSIONS.has(ext)) return false

  const normalizedType = contentType.toLowerCase().split(";")[0].trim()
  return ALLOWED_MIME_PREFIXES.some((prefix) => normalizedType.startsWith(prefix))
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      { status: 429 },
    )
  }

  try {
    const body = await req.json()
    const { fileName, contentType } = body

    if (!fileName || !contentType || typeof fileName !== "string" || typeof contentType !== "string") {
      return NextResponse.json(
        { error: "fileName и contentType обязательны" },
        { status: 400 },
      )
    }

    // Validate file name length
    if (fileName.length > 255) {
      return NextResponse.json({ error: "Слишком длинное имя файла" }, { status: 400 })
    }

    // Validate file type
    if (!isAllowedFile(fileName, contentType)) {
      return NextResponse.json(
        { error: "Недопустимый тип файла. Разрешены: STL, OBJ, 3MF, STEP, JPG, PNG, WEBP, HEIC" },
        { status: 400 },
      )
    }

    const ext = fileName.split(".").pop()?.toLowerCase() ?? "bin"
    const key = `orders/${nanoid()}/${Date.now()}.${ext}`

    const url = await getPresignedUploadUrl(key, contentType)
    const fileUrl = getS3Url(key)

    return NextResponse.json({ url, key, fileUrl })
  } catch {
    return NextResponse.json({ error: "Ошибка генерации URL" }, { status: 500 })
  }
}
