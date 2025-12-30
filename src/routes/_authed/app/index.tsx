import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/app/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    return {
      user: context.user!,
    }
  },
})

function RouteComponent() {
  const data = Route.useLoaderData()

  return <p>Hello {data.user.email}</p>
}
