import { eq } from 'drizzle-orm'
import type { Context } from 'hono'
import { z } from 'zod'
import { errorResponse } from '@/lib/fetching/error-response'
import { isUniqueViolation } from '@/lib/postgres-errors'
import { profiles } from '../../db/schema'
import { getProfileById, requireRequestContext } from './context'
import type { WorkerEnv } from './env'

type HonoContext = Context<{ Bindings: WorkerEnv }>

const updateProfileSchema = z.discriminatedUnion('column', [
  z.object({ column: z.literal('username'), value: z.string().min(3) }),
  z.object({ column: z.literal('avatar_url'), value: z.string().nullable() }),
])

const getProfileUpdate = (update: z.infer<typeof updateProfileSchema>) => {
  switch (update.column) {
    case 'avatar_url':
      return { avatarUrl: update.value }
    case 'username':
      return { username: update.value }
  }
}

/** `GET /api/me`: the signed-in person's profile. */
export const getCurrentProfile = async (context: HonoContext) => {
  const requestContext = await requireRequestContext(context)
  if (requestContext instanceof Response) return requestContext

  return context.json({ data: requestContext.profile, error: null })
}

/** `PATCH /api/me`: changes one profile field. Unexpected errors go to `app.onError`. */
export const updateCurrentProfile = async (context: HonoContext) => {
  const requestContext = await requireRequestContext(context)
  if (requestContext instanceof Response) return requestContext

  // A body that is not JSON fails the schema below and gets a 400.
  const body: unknown = await context.req.json().catch(() => null)
  const parsed = updateProfileSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse({
      error: z.prettifyError(parsed.error),
      reason: 'Invalid profile update payload',
      status: 400,
    })
  }

  const userId = requestContext.user.id

  try {
    await requestContext.db
      .update(profiles)
      .set({ ...getProfileUpdate(parsed.data), updatedAt: new Date() })
      .where(eq(profiles.id, userId))
  } catch (error) {
    // Only `username` is unique, so this is the one conflict a person can fix.
    if (!isUniqueViolation(error)) throw error
    return errorResponse({
      error: 'That username is taken. Choose another one.',
      reason: 'Duplicate username',
      status: 409,
    })
  }

  const profile = await getProfileById(requestContext.db, userId)

  return context.json({ data: profile, error: null })
}
