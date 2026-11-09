import { createContext, type ReactNode, useContext } from 'react'
import { type AuthSession, authClient } from '@/lib/auth/client'

interface SessionContextValue {
  /** `undefined` while loading, `null` when signed out. */
  session: AuthSession | null | undefined
}

const SessionContext = createContext<SessionContextValue>({
  session: undefined,
})

/** Puts the live better-auth session in context, for the router. */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const session = useSession()

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  )
}

/** Reads the session from `AuthProvider`. */
export const useAuthContext = () => useContext(SessionContext)

/** The live better-auth session: `undefined` while loading, `null` when signed out. */
export const useSession = (): AuthSession | null | undefined => {
  const { data: session, isPending } = authClient.useSession()
  return isPending ? undefined : session
}
