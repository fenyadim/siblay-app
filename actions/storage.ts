'use server'

import { revalidatePath } from 'next/cache'

import { hasCurrentAdminSession } from '@/lib/admin-session'
import { deleteS3Object } from '@/lib/s3'
import { findStorageReferences, headStorageFile, isRecentAppUpload, isS3Key } from '@/lib/storage-admin'

export async function deleteStorageFile(key: string, etag: string) {
  if (!await hasCurrentAdminSession()) return { error: 'Войдите в админку, чтобы удалить файл.' }
  if (!isS3Key(key) || typeof etag !== 'string' || !/^"[\w-]{1,128}"$/.test(etag)) {
    return { error: 'Обновите список и попробуйте ещё раз.' }
  }

  try {
    if ((await findStorageReferences([key])).has(key)) {
      return { error: 'Файл используется на сайте. Сначала уберите его из связанной записи.' }
    }
    const object = await headStorageFile(key)
    if (object.ETag !== etag) return { error: 'Файл изменился. Обновите список и проверьте его.' }
    if (isRecentAppUpload(key, object.LastModified)) {
      return { error: 'Файл недавно загружен. Попробуйте удалить его позже.' }
    }

    await deleteS3Object(key)
  } catch (error) {
    if (error instanceof Error && (error.name === 'NotFound' || error.name === 'NoSuchKey')) {
      return { error: 'Файл уже удалён. Обновите список.' }
    }
    console.error('[storage] Delete failed', error)
    return { error: 'Не удалось удалить файл из S3.' }
  }

  revalidatePath('/admin/storage')
  return { success: true }
}
