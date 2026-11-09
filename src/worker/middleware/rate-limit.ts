import { createMiddleware } from 'hono/factory'
import { errorResponse } from '@/lib/fetching/error-response'

interface RateLimitEnv {
  AUTH_RATE_LIMITER: Pick<RateLimit, 'limit'>
}

/**
 * Best-effort limit on POSTs per IP, with the `AUTH_RATE_LIMITER` binding
 * (see `wrangler.jsonc`). Cloudflare counts per location, so this slows
 * password guessing and reset-email spam but is not a hard global cap.
 * GETs (like the session check) pass through.
 */
export const authRateLimit = createMiddleware<{ Bindings: RateLimitEnv }>(
  async (c, next) => {
    if (c.req.method !== 'POST') return next()

    // Cloudflare sets this on every request. Local dev may not, so all
    // local requests share one bucket.
    const ip = c.req.header('cf-connecting-ip') ?? 'unknown'
    const { success } = await c.env.AUTH_RATE_LIMITER.limit({ key: ip })

    if (!success) {
      return errorResponse({
        error: 'Too many attempts. Wait a minute, then try again.',
        reason: 'Rate limited',
        status: 429,
      })
    }

    await next()
  },
)
