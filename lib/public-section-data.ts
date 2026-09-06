const CONNECTION_CODES = new Set([
  'P1001',
  'P1002',
  'P1017',
  'P2024',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EPIPE',
  'ENOTFOUND',
  'EAI_AGAIN',
  '08000',
  '08001',
  '08003',
  '08006',
  '57P01',
  '57P02',
  '57P03',
])

function isConnectionError(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== 'object' || depth > 4) return false
  const value = error as Record<string, unknown>
  if (typeof value.code === 'string' && CONNECTION_CODES.has(value.code)) return true
  if (typeof value.originalCode === 'string' && CONNECTION_CODES.has(value.originalCode))
    return true
  if (value.kind === 'ConnectionClosed' || value.kind === 'DatabaseNotReachable') return true
  if (
    typeof value.message === 'string' &&
    /connection (?:terminated|closed)|timeout exceeded when trying to connect/i.test(value.message)
  )
    return true
  return ['cause', 'meta', 'driverAdapterError'].some((key) =>
    isConnectionError(value[key], depth + 1)
  )
}

/** Only for optional public sections. Never wrap writes or admin queries with this. */
export async function readPublicSection<T>(
  name: string,
  read: () => Promise<T>
): Promise<T | null> {
  try {
    return await read()
  } catch (error) {
    if (!isConnectionError(error)) throw error
  }

  // A failed pg connection is removed from the pool; retry the read on a fresh connection.
  await new Promise((resolve) => setTimeout(resolve, 200))
  try {
    return await read()
  } catch (error) {
    if (!isConnectionError(error)) throw error
    console.warn(`[${name}] PostgreSQL unavailable after retry; public section omitted`)
    return null
  }
}
