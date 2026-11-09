import { createAuthClient } from 'better-auth/react'

/** The better-auth client for the browser. */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : undefined,
})

/** A signed-in session, as better-auth returns it. */
export type AuthSession = typeof authClient.$Infer.Session
