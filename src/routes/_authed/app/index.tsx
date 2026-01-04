import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { getUserProfileOptions } from '@/lib/fetching/user'

export const Route = createFileRoute('/_authed/app/')({
  component: RouteComponent,
})

function RouteComponent() {
  // Test query using debug endpoint
  const { data: debug } = useQuery({
    queryFn: async () => {
      const res = await fetch('/api/debug')
      if (!res.ok) {
        throw new Error('Failed to fetch debug info')
      }
      return await res.json()
    },
    queryKey: ['debug'],
  })

  const { data: user } = useQuery(getUserProfileOptions())

  return (
    <>
      <p>Hello {user?.email}</p>
      <p>Debug: {debug?.message}</p>
    </>
  )
}
