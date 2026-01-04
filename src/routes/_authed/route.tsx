import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import LogoutButton from '@/components/LogoutButton'
import { getSession } from '@/lib/fetching/user'
import { ROUTE_SIGNIN } from '../../constants'

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
