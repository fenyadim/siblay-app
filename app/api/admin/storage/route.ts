import {
  MaxFileSizeExceededError,
  MaxTotalSizeExceededError,
  MultipartParseError,
  parseMultipartRequest,
} from '@remix-run/multipart-parser'
import { nanoid } from 'nanoid'
import type { NextRequest } from 'next/server'

import { hasAdminSession } from '@/lib/admin-session'
import { MAX_MODEL_SIZE } from '@/lib/attachments'
import { createRateLimiter, getClientId } from '@/lib/rate-limit'
import { uploadS3Object } from '@/lib/s3'
import { downloadStorageFile, isS3Key } from '@/lib/storage-admin'

const limiter = createRateLimiter({ limit: 120, windowMs: 60 * 1000, name: 'admin-storage' })
const FILE_LIMIT = MAX_MODEL_SIZE

async function accessError(req: NextRequest) {
  const rate = limiter(getClientId(req.headers))
  if (!rate.allowed) {
    return Response.json({ error: 'Слишком много запросов. Попробуйте позже.' }, {
      status: 429,
      headers: { 'Retry-After': String(rate.retryAfter) },
    })
  }
  if (!await hasAdminSession(req.headers)) {
    return Response.json({ error: 'Войдите в админку.' }, { status: 401 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const denied = await accessError(req)
    if (denied) return denied

    const key = req.nextUrl.searchParams.get('key')
    if (!isS3Key(key)) return Response.json({ error: 'Некорректный ключ файла.' }, { status: 400 })

    const object = await downloadStorageFile(key, req.signal)
    if (!object.Body) throw new Error('The S3 response has no body')

    const filename = key.split('/').pop() || 'file'
    const encoded = encodeURIComponent(filename).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16)}`)
    const headers = new Headers({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="file"; filename*=UTF-8''${encoded}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    })
    if (object.ContentLength !== undefined) headers.set('Content-Length', String(object.ContentLength))
    return new Response(object.Body.transformToWebStream(), { headers })
  } catch (error) {
    if (error instanceof Error && (error.name === 'NoSuchKey' || error.name === 'NotFound')) {
      return Response.json({ error: 'Файл не найден.' }, { status: 404 })
    }
    console.error('[storage] Download failed', error)
    return Response.json({ error: 'Не удалось скачать файл из S3.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const denied = await accessError(req)
    if (denied) return denied
    if (req.headers.get('X-Requested-With') !== 'XMLHttpRequest') {
      return Response.json({ error: 'Загрузите файл через админку.' }, { status: 403 })
    }

    const parts = parseMultipartRequest(req, {
      maxFileSize: FILE_LIMIT,
      maxTotalSize: FILE_LIMIT,
      maxParts: 1,
    })
    try {
      const { value: file, done } = await parts.next()
      if (done || file.name !== 'file' || !file.filename || file.size === 0) {
        return Response.json({ error: 'Выберите непустой файл.' }, { status: 400 })
      }
      const filename = file.filename.split(/[/\\]/).pop()?.replace(/[\u0000-\u001f\u007f]/g, '_') ?? ''
      if (!filename || filename === '.' || filename === '..' || filename.length > 255) {
        return Response.json({ error: 'Некорректное имя файла.' }, { status: 400 })
      }
      if (!(await parts.next()).done) return Response.json({ error: 'Загрузите один файл.' }, { status: 400 })
      req.signal.throwIfAborted()

      const key = `admin/${nanoid()}/${filename}`
      await uploadS3Object(key, file.bytes, 'application/octet-stream')
      return Response.json({ key }, { status: 201 })
    } finally {
      await parts.return()
    }
  } catch (error) {
    if (error instanceof MaxFileSizeExceededError || error instanceof MaxTotalSizeExceededError) {
      return Response.json({ error: 'Максимальный размер файла — 100 МБ.' }, { status: 413 })
    }
    if (error instanceof MultipartParseError) {
      return Response.json({ error: 'Загрузите один файл.' }, { status: 400 })
    }
    console.error('[storage] Upload failed', error)
    return Response.json({ error: 'Не удалось загрузить файл в S3.' }, { status: 500 })
  }
}
