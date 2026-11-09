import { Hono } from 'hono'
import { describe, expect, it } from 'vitest'
import { authRateLimit } from './rate-limit'

const createApp = () => {
  const app = new Hono()
  app.use('*', authRateLimit)
  app.all('*', (c) => c.text('ok'))
  return app
}

const createEnv = (success: boolean) => {
  const keys: string[] = []
  return {
    env: {
      AUTH_RATE_LIMITER: {
        limit: async ({ key }: { key: string }) => {
          keys.push(key)
          return { success }
        },
      },
    },
    keys,
  }
}

describe('authRateLimit', () => {
  it('sends 429 when the limit is reached', async () => {
    const { env } = createEnv(false)
    const response = await createApp().request('/', { method: 'POST' }, env)
    expect(response.status).toBe(429)
  })

  it('lets a POST through under the limit, keyed by IP', async () => {
    const { env, keys } = createEnv(true)
    const response = await createApp().request(
      '/',
      { headers: { 'cf-connecting-ip': '203.0.113.7' }, method: 'POST' },
      env,
    )
    expect(response.status).toBe(200)
    expect(keys).toEqual(['203.0.113.7'])
  })

  it('does not count GETs', async () => {
    const { env, keys } = createEnv(false)
    const response = await createApp().request('/', { method: 'GET' }, env)
    expect(response.status).toBe(200)
    expect(keys).toEqual([])
  })
})
