import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import * as schema from './schema'

/** Drizzle client with the app's schema. */
export type Db = NodePgDatabase<typeof schema>

/** The part of a Cloudflare Hyperdrive binding we use. */
export interface HyperdriveBinding {
  connectionString: string
}

/** Env vars that can point at the database. */
export interface DbEnv {
  DATABASE_URL?: string
  HYPERDRIVE?: HyperdriveBinding
}

/** Hyperdrive's connection string when bound, else `DATABASE_URL`. Throws when neither is set. */
export const getDatabaseUrl = (env: DbEnv) => {
  const databaseUrl = env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('Missing database connection string')
  }

  return databaseUrl
}

/** A new, unconnected `pg` client and its Drizzle wrapper. The caller connects and closes it. */
export const createDbClient = (env: DbEnv) => {
  const client = new Client({ connectionString: getDatabaseUrl(env) })
  const db = drizzle(client, { schema })
  return { client, db }
}
