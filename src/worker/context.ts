import { eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { createAuth } from '@/lib/auth/server'
import { errorResponse } from '@/lib/fetching/error-response'
import type { UserProfile } from '@/types/db'
import type { Db } from '../../db/client'
import { profiles } from '../../db/schema'
import type { WorkerEnv } from './env'

interface RequestUser {
  email: string
  id: string
}

/** Who is asking, and the request's db client. `user` is `null` when signed out. */
export interface RequestContext {
  db: Db
  profile: UserProfile | null
  user: RequestUser | null
}

/** A `RequestContext` for a signed-in person. */
export interface AuthedRequestContext extends RequestContext {
  profile: UserProfile
  user: RequestUser
}

type Profile = typeof profiles.$inferSelect

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** Maps a `profiles` row to the snake_case shape the API sends. */
export const profileToRow = (profile: Profile): UserProfile => ({
  api_key: profile.apiKey,
  avatar_url: profile.avatarUrl,
  id: profile.id,
  updated_at: profile.updatedAt?.toISOString() ?? null,
  username: profile.username,
})

const getBearerToken = (request: Context['req']) => {
  const authHeader = request.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice('Bearer '.length).trim() || null
}

/** The profile for a user ID, or `null`. */
export const getProfileById = async (db: Db, userId: string) => {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1)
  return profile ? profileToRow(profile) : null
}

/** The profile that owns an API key, or `null`. Rejects keys that are not UUIDs before the query. */
export const getProfileByApiKey = async (db: Db, apiKey: string) => {
  if (!uuidPattern.test(apiKey)) return null
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.apiKey, apiKey))
    .limit(1)
  return profile ? profileToRow(profile) : null
}

/** Reads the session cookie, then a `Bearer` API key. Use for routes where sign-in is optional. */
export const createRequestContext = async (
  context: Context<{ Bindings: WorkerEnv }>,
): Promise<RequestContext> => {
  const db = context.var.db
  const auth = createAuth(context.env, db)
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  })

  if (session?.user) {
    return {
      db,
      profile: await getProfileById(db, session.user.id),
      user: { email: session.user.email, id: session.user.id },
    }
  }

  const bearerToken = getBearerToken(context.req)

  if (bearerToken) {
    const profile = await getProfileByApiKey(db, bearerToken)
    return {
      db,
      profile,
      user: profile ? { email: profile.username ?? '', id: profile.id } : null,
    }
  }

  return { db, profile: null, user: null }
}

/**
 * Like `createRequestContext`, but returns a 401 `Response` when nobody is
 * signed in. Check `instanceof Response` and return it.
 */
export const requireRequestContext = async (
  context: Context<{ Bindings: WorkerEnv }>,
): Promise<AuthedRequestContext | Response> => {
  const requestContext = await createRequestContext(context)
  const { profile, user } = requestContext

  if (!user || !profile) {
    return errorResponse({
      error: 'Authentication required',
      reason: 'Missing or invalid session/API key',
      status: 401,
    })
  }

  return { ...requestContext, profile, user }
}
