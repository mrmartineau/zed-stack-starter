import { createFileRoute, Link } from '@tanstack/react-router'
import { useSession } from '@/components/AuthProvider'
import { ROUTE_APP_HOME, ROUTE_SIGNIN, ROUTE_SIGNUP } from '@/constants'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const session = useSession()

  return (
    <div>
      <header className="p-4 flex gap-2 items-center justify-center">
        <p>
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        {session ? (
          <Link to={ROUTE_APP_HOME}>App</Link>
        ) : (
          <>
            <Link to={ROUTE_SIGNIN}>Login</Link>
            <Link to={ROUTE_SIGNUP}>Sign Up</Link>
          </>
        )}
      </header>
    </div>
  )
}
