import { Button } from '@mrmartineau/zui/react'
import { SignOutIcon } from '@phosphor-icons/react'
import { useNavigate } from '@tanstack/react-router'
import { CONTENT, ROUTE_SIGNIN } from '@/constants'
import { authClient } from '@/lib/auth/client'

/** Signs out, then goes to the sign-in page. */
export function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authClient.signOut()
    await navigate({ to: ROUTE_SIGNIN })
  }

  return (
    <Button variant="ghost" onClick={handleLogout}>
      {/* The button text names it, so the icon is decorative. */}
      <SignOutIcon aria-hidden="true" size={18} weight="duotone" />
      {CONTENT.signOutNav}
    </Button>
  )
}
