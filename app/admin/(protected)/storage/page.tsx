import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { FormattedDate } from '@/components/admin/FormattedDate'
import { StorageFileControls, StorageUpload } from '@/components/admin/StorageFileControls'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { hasCurrentAdminSession } from '@/lib/admin-session'
import { isS3Key, listStorageFiles } from '@/lib/storage-admin'
import { formatFileSize } from '@/lib/utils'

const PATH = '/admin/storage'
const FILTERS = [
  { prefix: '', label: 'Все файлы' },
  { prefix: 'orders/', label: 'Заказы и заявки' },
  { prefix: 'portfolio/', label: 'Портфолио' },
  { prefix: 'admin/', label: 'Ручные загрузки' },
]

function storageHref(prefix?: string, cursor?: string) {
  const params = new URLSearchParams()
  if (prefix) params.set('prefix', prefix)
  if (cursor) params.set('cursor', cursor)
  return params.size ? `${PATH}?${params.toString()}` : PATH
}

export default async function AdminStoragePage({
  searchParams,
}: {
  searchParams: Promise<{ prefix?: string | string[]; cursor?: string | string[] }>
}) {
  if (!await hasCurrentAdminSession()) redirect('/admin/login')

  const params = await searchParams
  const prefix = isS3Key(params.prefix) ? params.prefix : undefined
  const cursor = typeof params.cursor === 'string' ? params.cursor : undefined
  const storage = await listStorageFiles(prefix, cursor).catch((error) => {
    console.error('[storage] List failed', error)
    return null
  })

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-black text-foreground font-display">Хранилище S3</h1>
        {storage && <p className="mt-1 break-all font-mono text-xs text-muted">{storage.bucket}</p>}
      </header>

      <StorageUpload />

      <div className="space-y-3">
        <nav className="flex flex-wrap gap-2" aria-label="Разделы хранилища">
          {FILTERS.map((filter) => {
            const active = (prefix ?? '') === filter.prefix
            return (
              <Button key={filter.prefix} variant={active ? 'default' : 'outline'} size="sm" asChild>
                <Link href={storageHref(filter.prefix)} aria-current={active ? 'page' : undefined}>
                  {filter.label}
                </Link>
              </Button>
            )
          })}
        </nav>
        <form action={PATH} className="flex flex-wrap items-center gap-2" key={prefix}>
          <Input
            name="prefix"
            type="search"
            defaultValue={prefix}
            aria-label="Начало ключа файла"
            placeholder="Начало ключа, например portfolio/"
            className="max-w-sm"
          />
          <Button type="submit" variant="outline">Найти</Button>
        </form>
      </div>

      {storage ? (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Ключ файла</TableHead>
                  <TableHead>Размер</TableHead>
                  <TableHead>Изменён</TableHead>
                  <TableHead>Использование</TableHead>
                  <TableHead><span className="sr-only">Действия</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storage.files.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="p-8 text-center text-muted">Файлы не найдены</TableCell></TableRow>
                )}
                {storage.files.map((file) => (
                  <TableRow key={file.key}>
                    <TableCell className="min-w-32 max-w-sm whitespace-normal break-all py-3 pl-4 font-mono text-xs">
                      {file.key}
                    </TableCell>
                    <TableCell>{file.size === undefined ? '—' : formatFileSize(file.size)}</TableCell>
                    <TableCell className="text-muted">
                      {file.lastModified ? <FormattedDate date={file.lastModified} /> : '—'}
                    </TableCell>
                    <TableCell>
                      {file.reference ? (
                        <Link href={file.reference.href} className="text-accent hover:underline">{file.reference.label}</Link>
                      ) : (
                        <span className="text-muted">{file.recent ? 'Недавно загружен' : '—'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StorageFileControls
                        objectKey={file.key}
                        url={file.url}
                        deleteEtag={file.reference || file.recent ? undefined : file.etag}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {(cursor || storage.nextCursor) && (
            <nav className="flex flex-wrap gap-2" aria-label="Страницы файлов">
              {cursor && <Button variant="outline" asChild><Link href={storageHref(prefix)}>В начало списка</Link></Button>}
              {storage.nextCursor && (
                <Button variant="outline" asChild>
                  <Link href={storageHref(prefix, storage.nextCursor)}>Следующая страница <ArrowRight /></Link>
                </Button>
              )}
            </nav>
          )}
        </>
      ) : (
        <p role="alert" className="rounded-xl border border-border bg-surface p-4 text-sm text-destructive">
          Не удалось получить список файлов из S3. Обновите страницу, чтобы повторить запрос.
        </p>
      )}
    </div>
  )
}
