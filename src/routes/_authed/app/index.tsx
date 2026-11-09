import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { API_ROOT } from '@/constants'
import { getUserProfileOptions } from '@/lib/fetching/user'

export const Route = createFileRoute('/_authed/app/')({
  component: RouteComponent,
})

const getApiStatus = async ({ signal }: { signal?: AbortSignal }) => {
  const response = await fetch(API_ROOT, { signal })
  if (!response.ok) throw new Error('Could not reach the API')
  return response.text()
}

function RouteComponent() {
  const apiStatus = useQuery({ queryFn: getApiStatus, queryKey: ['apiStatus'] })
  const profile = useQuery(getUserProfileOptions())

  if (profile.status === 'pending') return <p>Loading…</p>
  if (profile.status === 'error') {
    return <p role="alert">{profile.error.message}</p>
  }

  return (
    <>
      <p>Hello {profile.data.data.username}</p>
      <p>API: {apiStatus.data ?? apiStatus.error?.message ?? '…'}</p>
    </>
  )
}
