import {
  MaxFileSizeExceededError,
  MaxPartsExceededError,
  MaxTotalSizeExceededError,
  MultipartParseError,
  parseMultipartRequest,
  type MultipartPart,
} from '@remix-run/multipart-parser'
import { nanoid } from 'nanoid'
import type { NextRequest } from 'next/server'

import {
  MAX_IMAGE_FILES,
  MAX_IMAGE_SIZE,
  MAX_MODEL_FILES,
  MAX_MODEL_SIZE,
  MAX_QUOTE_FILES,
  validateAttachment,
} from '@/lib/attachments'
import { createRateLimiter, getClientId } from '@/lib/rate-limit'
import { deleteS3Objects, getS3Url, uploadS3Object } from '@/lib/s3'
import { notifyOrder, notifyQuote, saveOrder, saveQuote, type StoredAttachment } from '@/lib/submissions'
import { orderDetailsSchema } from '@/lib/validations/order'
import { quoteDetailsSchema } from '@/lib/validations/quote'

const orderLimiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000, name: 'createOrder' })
const quoteLimiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000, name: 'createQuote' })
const MAX_DETAILS_SIZE = 32 * 1024

class InvalidSubmission extends Error {}

async function saveWithAttachments<T>(
  parts: AsyncIterable<MultipartPart>,
  constraints: { maxFiles: number; kind?: 'image' | 'model' },
  signal: AbortSignal,
  save: (files: StoredAttachment[]) => Promise<T>,
) {
  const files: StoredAttachment[] = []
  const keys: string[] = []

  try {
    for await (const part of parts) {
      signal.throwIfAborted()
      if (part.name !== 'file' || !part.filename) throw new InvalidSubmission('Некорректное вложение')
      if (files.length >= constraints.maxFiles) {
        throw new InvalidSubmission(`Максимум ${constraints.maxFiles} файлов`)
      }

      const type = validateAttachment(part.filename, part.size, constraints.kind)
      if ('error' in type) throw new InvalidSubmission(`${part.filename}: ${type.error}`)

      const key = `orders/${nanoid()}/${Date.now()}.${type.extension}`
      keys.push(key)
      await uploadS3Object(key, part.bytes, type.contentType)
      files.push({
        fileName: part.filename,
        fileUrl: getS3Url(key),
        fileType: type.contentType,
        fileSize: part.size,
      })
    }

    signal.throwIfAborted()
    return await save(files)
  } catch (error) {
    await deleteS3Objects(keys).catch((cleanupError) => {
      console.error('[submissions] Could not clean up S3 attachments', cleanupError)
    })
    throw error
  }
}

export async function POST(req: NextRequest) {
  const kind = req.nextUrl.searchParams.get('kind')
  if (kind !== 'order' && kind !== 'quote') {
    return Response.json({ error: 'Неизвестный тип заявки' }, { status: 400 })
  }

  const rateLimit = (kind === 'order' ? orderLimiter : quoteLimiter)(getClientId(req.headers))
  if (!rateLimit.allowed) {
    const minutes = Math.ceil(rateLimit.retryAfter / 60)
    return Response.json({ error: `Слишком много заявок. Попробуйте через ${minutes} мин.` }, {
      status: 429,
      headers: { 'Retry-After': String(rateLimit.retryAfter) },
    })
  }

  const maxFiles = kind === 'order' ? MAX_IMAGE_FILES : MAX_QUOTE_FILES
  const maxFilesSize = kind === 'order'
    ? Math.max(MAX_MODEL_FILES * MAX_MODEL_SIZE, MAX_IMAGE_FILES * MAX_IMAGE_SIZE)
    : MAX_QUOTE_FILES * MAX_MODEL_SIZE
  const parts = parseMultipartRequest(req, {
    maxHeaderSize: 8 * 1024,
    maxFileSize: MAX_MODEL_SIZE,
    maxParts: maxFiles + 1,
    maxTotalSize: maxFilesSize + MAX_DETAILS_SIZE,
  })

  try {
    const first = await parts.next()
    if (first.done || first.value.name !== 'details' || first.value.isFile || first.value.size > MAX_DETAILS_SIZE) {
      throw new InvalidSubmission('Некорректные данные заявки')
    }

    const details: unknown = JSON.parse(first.value.text)
    if (kind === 'order') {
      const parsed = orderDetailsSchema.safeParse(details)
      if (!parsed.success) throw new InvalidSubmission(parsed.error.issues[0].message)

      const constraints = parsed.data.hasModel
        ? { maxFiles: MAX_MODEL_FILES, kind: 'model' as const }
        : { maxFiles: MAX_IMAGE_FILES, kind: 'image' as const }
      const order = await saveWithAttachments(parts, constraints, req.signal, (files) => saveOrder(parsed.data, files))
      notifyOrder(order)
      return Response.json({ id: order.id }, { status: 201 })
    }

    const parsed = quoteDetailsSchema.safeParse(details)
    if (!parsed.success) throw new InvalidSubmission(parsed.error.issues[0].message)

    const quote = await saveWithAttachments(parts, { maxFiles: MAX_QUOTE_FILES }, req.signal, (files) => saveQuote(parsed.data, files))
    notifyQuote(quote)
    return Response.json({ id: quote.id }, { status: 201 })
  } catch (error) {
    if (error instanceof InvalidSubmission) return Response.json({ error: error.message }, { status: 400 })
    if (error instanceof MaxFileSizeExceededError || error instanceof MaxTotalSizeExceededError || error instanceof MaxPartsExceededError) {
      return Response.json({ error: 'Превышен лимит размера или количества файлов' }, { status: 413 })
    }
    if (error instanceof MultipartParseError || error instanceof SyntaxError) {
      return Response.json({ error: 'Некорректные данные заявки' }, { status: 400 })
    }

    console.error('[submissions]', error)
    return Response.json({ error: 'Не удалось отправить заявку. Попробуйте ещё раз.' }, { status: 500 })
  } finally {
    await parts.return()
  }
}
