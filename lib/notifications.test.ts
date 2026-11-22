import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sendTelegram } from './notifications'

vi.mock('node:timers/promises', () => ({
  setTimeout: vi.fn().mockResolvedValue(undefined),
}))

describe('sendTelegram', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('TELEGRAM_BOT_TOKEN', 'test-token')
    vi.stubEnv('TELEGRAM_CHAT_ID', '123')
    vi.stubEnv('TELEGRAM_HTTPS_PROXY', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('retries a timeout with a fresh signal and the same notification', async () => {
    const expired = AbortSignal.abort(new DOMException('Timed out', 'TimeoutError'))
    const nextSignal = new AbortController().signal
    const timeout = vi
      .spyOn(AbortSignal, 'timeout')
      .mockReturnValueOnce(expired)
      .mockReturnValueOnce(nextSignal)
    fetchMock
      .mockRejectedValueOnce(expired.reason)
      .mockResolvedValueOnce(new Response(null, { status: 200 }))

    await sendTelegram('<b>Новый заказ</b>', { parseMode: 'HTML', disableWebPagePreview: true })

    expect(timeout.mock.calls).toEqual([[10_000], [10_000]])
    const [first, second] = fetchMock.mock.calls
    expect(first[1]?.signal).toBe(expired)
    expect(second[1]?.signal).toBe(nextSignal)
    expect(second[1]?.body).toBe(first[1]?.body)
  })

  it('retries a temporary HTTP error only once', async () => {
    fetchMock.mockImplementation(async () => new Response(null, { status: 503 }))

    await expect(sendTelegram('Test')).rejects.toThrow('HTTP 503 on attempt 2')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not retry a rejected token or chat', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }))

    await expect(sendTelegram('Test')).rejects.toThrow('HTTP 401 on attempt 1')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
