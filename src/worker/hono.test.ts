import { describe, expect, it } from 'vitest'
import { app } from './hono'

describe('API headers', () => {
  it('stops shared caches keeping API responses', async () => {
    const response = await app.request('/api')
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })
})
