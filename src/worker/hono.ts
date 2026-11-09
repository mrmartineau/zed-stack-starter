import { Hono } from 'hono'
import { createAuth } from '@/lib/auth/server'
import { errorResponse } from '@/lib/fetching/error-response'
import type { WorkerEnv } from './env'
import { dbMiddleware } from './middleware/db'
import { getCurrentProfile, updateCurrentProfile } from './profile'

/** The Hono app for everything under `/api`. */
export const app = new Hono<{ Bindings: WorkerEnv }>().basePath('/api')

// Routes that do not touch the database — declared before dbMiddleware
// so they skip the per-request Postgres connection.
app.get('/', (c) => c.text('Z Stack API', 200))

app.use('*', dbMiddleware)

app.on(['GET', 'POST'], '/auth/*', (c) =>
  createAuth(c.env, c.var.db).handler(c.req.raw),
)

app.get('/me', getCurrentProfile)
app.patch('/me', updateCurrentProfile)

app.notFound((c) => c.text('Not found', 404))

// Log the details here; never send stack traces or SQL to the browser.
app.onError((error, c) => {
  console.error({
    error,
    method: c.req.method,
    msg: '[api] Unhandled error',
    path: c.req.path,
  })
  return errorResponse({
    error: 'Something went wrong',
    reason: 'Unexpected server error',
    status: 500,
  })
})
