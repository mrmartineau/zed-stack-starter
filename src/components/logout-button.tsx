import { Button } from '@mrmartineau/zui/react'
import { SignOutIcon } from '@phosphor-icons/react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { CONTENT, ROUTE_SIGNIN } from '@/constants'
import { authClient } from '@/lib/auth/client'

/** Signs out, clears cached data, then goes to the sign-in page. */
export function LogoutButton() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setError(null)
    const { error } = await authClient.signOut()

    if (error) {
      setError(error.message ?? 'Could not sign out. Try again.')
      return
    }

    await navigate({ to: ROUTE_SIGNIN })
    // Clear after the authed pages unmount, so their queries do not refetch
    // and fail. The next person to sign in on this tab sees none of this data.
    queryClient.clear()
  }

  return (
    <>
      <Button variant="ghost" onClick={handleLogout}>
        {/* The button text names it, so the icon is decorative. */}
        <SignOutIcon aria-hidden="true" size={18} weight="duotone" />
        {CONTENT.signOutNav}
      </Button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  )
}
