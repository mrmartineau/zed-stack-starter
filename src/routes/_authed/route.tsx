import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { LogoutButton } from '@/components/logout-button'
import { ROUTE_SIGNIN } from '@/constants'
import { getSession } from '@/lib/fetching/user'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: ROUTE_SIGNIN })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <LogoutButton />
      <Outlet />
    </>
  )
}
