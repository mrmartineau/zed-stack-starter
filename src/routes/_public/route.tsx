import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { ROUTE_APP_HOME } from '@/constants'
import { getSession } from '@/lib/fetching/user'

export const Route = createFileRoute('/_public')({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: ROUTE_APP_HOME })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
