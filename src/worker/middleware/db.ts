import { createMiddleware } from 'hono/factory'
import { createDbClient, type Db } from '../../../db/client'
import type { WorkerEnv } from '../env'

declare module 'hono' {
  interface ContextVariableMap {
    db: Db
  }
}

/** Opens one Postgres connection per request and puts it on `c.var.db`. */
export const dbMiddleware = createMiddleware<{
  Bindings: WorkerEnv
}>(async (c, next) => {
  const { client, db } = createDbClient(c.env)
  await client.connect()
  c.set('db', db)
  try {
    await next()
  } finally {
    c.executionCtx.waitUntil(
      client.end().catch((error) => {
        // The response is already sent; a failed close only needs a log.
        console.warn({ error, msg: '[db] Could not close connection' })
      }),
    )
  }
})
