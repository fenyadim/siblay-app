import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { readPublicSection } from '@/lib/public-section-data'

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('optional public database sections', () => {
  it('returns data without retrying a successful query', async () => {
    const read = vi.fn().mockResolvedValue([{ id: 'material' }])
    expect(await readPublicSection('materials', read)).toEqual([{ id: 'material' }])
    expect(read).toHaveBeenCalledTimes(1)
  })

  it('recovers from the reported connection termination', async () => {
    const read = vi
      .fn()
      .mockRejectedValueOnce(new Error('Connection terminated unexpectedly'))
      .mockResolvedValueOnce(['recovered'])
    const result = readPublicSection('reviews', read)
    await vi.runAllTimersAsync()
    expect(await result).toEqual(['recovered'])
    expect(read).toHaveBeenCalledTimes(2)
  })

  it.each([
    new Error('Connection terminated unexpectedly'),
    { code: 'P1001' },
    { code: 'ECONNRESET' },
    { meta: { driverAdapterError: { cause: { kind: 'ConnectionClosed' } } } },
  ])('omits a section after two failed connection attempts: %j', async (error) => {
    const read = vi.fn().mockRejectedValue(error)
    const result = readPublicSection('portfolio', read)
    await vi.runAllTimersAsync()
    expect(await result).toBeNull()
    expect(read).toHaveBeenCalledTimes(2)
    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it.each([new Error('Unexpected application bug'), { code: 'P2021' }, { code: 'P1000' }])(
    'does not hide schema, authentication or programming errors: %j',
    async (error) => {
      const read = vi.fn().mockRejectedValue(error)
      await expect(readPublicSection('materials', read)).rejects.toEqual(error)
      expect(read).toHaveBeenCalledTimes(1)
    }
  )

  it('does not hide a schema error encountered on the retry', async () => {
    const schemaError = { code: 'P2021' }
    const read = vi
      .fn()
      .mockRejectedValueOnce(new Error('Connection terminated unexpectedly'))
      .mockRejectedValueOnce(schemaError)
    const assertion = expect(readPublicSection('materials', read)).rejects.toEqual(schemaError)
    await vi.runAllTimersAsync()
    await assertion
  })
})
