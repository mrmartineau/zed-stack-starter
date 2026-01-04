import type { Session } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'
import { createContext, useContext } from 'react'
import { getSessionOptions } from '@/lib/fetching/user'

const SessionContext = createContext<{
  session: Session | null | undefined
}>({
  session: null,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const session = useSession()

  return (
    <SessionContext.Provider value={{ session }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(SessionContext)

  if (context === undefined) {
    throw new Error('useAuthContext has to be used within <AuthProvider>')
  }

  return context
}

export const useSession = () => {
  const { data: session } = useQuery(getSessionOptions())
  return session
}
