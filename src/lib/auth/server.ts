import { compare, hash } from 'bcryptjs'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth/minimal'
import type { Db, DbEnv } from '../../../db/client'
import {
  authAccounts,
  authJwks,
  authSessions,
  authUsers,
  authVerifications,
  profiles,
} from '../../../db/schema'

/** Env vars better-auth reads. */
export type AuthEnv = DbEnv & {
  BETTER_AUTH_SECRET?: string
  BETTER_AUTH_URL?: string
  BETTER_AUTH_TRUSTED_ORIGINS?: string
  BETTER_AUTH_DISABLE_SIGNUP?: string
}

const getTrustedOrigins = (env: AuthEnv) => {
  const origins = env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (origins?.length) {
    return origins
  }

  return env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : undefined
}

const isSignUpDisabled = (env: AuthEnv) =>
  env.BETTER_AUTH_DISABLE_SIGNUP === 'true'

/** A better-auth instance for one request. Also creates a profile row for each new user. */
export const createAuth = (env: AuthEnv, db: Db) => {
  return betterAuth({
    advanced: {
      database: {
        generateId: 'uuid',
      },
      trustedProxyHeaders: true,
    },
    basePath: '/api/auth',
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        account: authAccounts,
        jwks: authJwks,
        session: authSessions,
        user: authUsers,
        verification: authVerifications,
      },
    }),
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await db
              .insert(profiles)
              .values({
                id: user.id,
                username: user.email,
              })
              .onConflictDoNothing()
          },
        },
      },
    },
    emailAndPassword: {
      disableSignUp: isSignUpDisabled(env),
      enabled: true,
      password: {
        hash: (password) => hash(password, 10),
        verify: ({ hash: stored, password }) => compare(password, stored),
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: getTrustedOrigins(env),
  })
}
