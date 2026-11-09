import { createContext, type ReactNode, useContext } from 'react'
import { type AuthSession, authClient } from '@/lib/auth/client'

interface SessionContextValue {
  session: AuthSession | null
}

const SessionContext = createContext<SessionContextValue>({ session: null })

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

/** The live better-auth session, or `null` when signed out. */
export const useSession = () => {
  const { data: session } = authClient.useSession()
  return session
}
