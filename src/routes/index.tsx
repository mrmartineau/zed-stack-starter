import { createFileRoute, Link } from '@tanstack/react-router'
import { useSession } from '@/components/auth-provider'
import { ROUTE_APP_HOME, ROUTE_SIGNIN, ROUTE_SIGNUP } from '@/constants'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div>
      <header className="flex items-center justify-center gap-xs p-md">
        <p>
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <AuthLinks />
      </header>
    </div>
  )
}

function AuthLinks() {
  const session = useSession()

  // Render nothing until the session loads, so signed-in people never see "Login".
  if (session === undefined) return null
  if (session) return <Link to={ROUTE_APP_HOME}>App</Link>

  return (
    <>
      <Link to={ROUTE_SIGNIN}>Login</Link>
      <Link to={ROUTE_SIGNUP}>Sign Up</Link>
    </>
  )
}
