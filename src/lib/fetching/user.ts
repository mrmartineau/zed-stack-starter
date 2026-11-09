import { queryOptions } from '@tanstack/react-query'
import { API_ME } from '@/constants'
import { authClient } from '@/lib/auth/client'
import type { UserProfile } from '@/types/db'

/** The better-auth session, or `null` when signed out. */
export const getSession = async () => {
  const { data: session } = await authClient.getSession()
  return session
}

/** Query options for the session. */
export const getSessionOptions = () => {
  return queryOptions({
    queryFn: () => getSession(),
    queryKey: ['session'],
    staleTime: 5 * 1000,
  })
}

interface ProfileResponse {
  data?: UserProfile
  error?: string
  reason?: string
}

const readJsonBody = async (response: Response): Promise<ProfileResponse> => {
  try {
    return (await response.json()) as ProfileResponse
  } catch {
    // A proxy or crash page can send HTML. Its text must not reach the UI,
    // so treat it as an empty body and use the fallback message.
    return {}
  }
}

/** Fetches the signed-in person's profile. Throws the server's message on failure. */
export const getUserProfile = async ({
  signal,
}: {
  signal?: AbortSignal
} = {}) => {
  const response = await fetch(API_ME, { credentials: 'include', signal })
  const body = await readJsonBody(response)

  if (!response.ok || !body.data) {
    throw new Error(body.error ?? 'Could not load your profile')
  }

  return { data: body.data }
}

/** Query options for the signed-in person's profile. */
export const getUserProfileOptions = () => {
  return queryOptions({
    queryFn: ({ signal }) => getUserProfile({ signal }),
    queryKey: ['userProfile'],
    staleTime: 5 * 1000,
  })
}
