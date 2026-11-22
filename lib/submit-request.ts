export async function submitRequest(
  kind: 'order' | 'quote',
  { files, ...details }: { files: File[] },
): Promise<{ id: string } | { error: string }> {
  const body = new FormData()
  body.set('details', JSON.stringify(details))
  for (const file of files) body.append('file', file)

  const response = await fetch(`/api/submissions?kind=${kind}`, { method: 'POST', body })
  const result = await response.json()
  if (response.ok && typeof result.id === 'string') return { id: result.id }
  if (typeof result.error === 'string') return { error: result.error }

  throw new Error('Unexpected submission response')
}
