'use client'

import { Copy, Download, Loader2, Trash2, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { deleteStorageFile } from '@/actions/storage'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { MAX_MODEL_SIZE } from '@/lib/attachments'

const STORAGE_API = '/api/admin/storage'

export function StorageUpload() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>()

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (uploading) return
    const form = event.currentTarget
    const data = new FormData(form)
    const file = data.get('file')
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_MODEL_SIZE) {
      setError('Выберите непустой файл размером до 100 МБ.')
      return
    }

    setError(undefined)
    setUploading(true)
    try {
      const response = await fetch(STORAGE_API, {
        method: 'POST',
        body: data,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
      const result = await response.json()
      if (!response.ok || typeof result.key !== 'string') {
        setError(result.error ?? 'Не удалось загрузить файл.')
        return
      }

      form.reset()
      toast.success('Файл загружен в S3')
      router.push(`/admin/storage?${new URLSearchParams({ prefix: result.key }).toString()}`)
    } catch {
      setError('Не удалось загрузить файл.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={upload} className="space-y-2 rounded-xl border border-border bg-surface p-4">
      <label htmlFor="storage-file" className="text-sm font-medium text-foreground">
        Загрузить файл в S3
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <Input id="storage-file" name="file" type="file" required disabled={uploading} className="max-w-xs" />
        <Button type="submit" disabled={uploading}>
          {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
          {uploading ? 'Загрузка…' : 'Загрузить публично'}
        </Button>
      </div>
      <p className="text-xs text-muted">До 100 МБ. Файл в папке admin/ будет доступен по прямой ссылке.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>
  )
}

export function StorageFileControls({
  objectKey,
  url,
  deleteEtag,
}: {
  objectKey: string
  url: string
  deleteEtag?: string
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>()
  const [deleting, startTransition] = useTransition()

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Ссылка S3 скопирована')
    } catch {
      toast.error('Не удалось скопировать ссылку S3')
    }
  }

  function remove() {
    if (!deleteEtag) return
    startTransition(async () => {
      setError(undefined)
      try {
        const result = await deleteStorageFile(objectKey, deleteEtag)
        if (result.error) {
          setError(result.error)
          return
        }

        setOpen(false)
        toast.success('Файл удалён из S3')
      } catch {
        setError('Не удалось удалить файл.')
      }
    })
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" asChild>
        <a href={`${STORAGE_API}?${new URLSearchParams({ key: objectKey }).toString()}`} download>
          <Download /> Скачать
        </a>
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={copyUrl} title="Скопировать ссылку S3" aria-label="Скопировать ссылку S3">
        <Copy />
      </Button>
      {deleteEtag && (
        <Dialog open={open} onOpenChange={(next) => {
          if (!deleting) {
            setError(undefined)
            setOpen(next)
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Удалить ${objectKey}`} className="text-destructive">
              <Trash2 />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Удалить файл из S3?</DialogTitle>
              <DialogDescription className="break-all">{objectKey}</DialogDescription>
            </DialogHeader>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" disabled={deleting}>Отмена</Button></DialogClose>
              <Button variant="destructive" onClick={remove} disabled={deleting}>
                {deleting && <Loader2 className="animate-spin" />}
                Удалить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
