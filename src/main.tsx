import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { AuthProvider, useAuthContext } from '@/components/auth-provider'
import { routeTree } from './routeTree.gen'
import './styles.css'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

/** The app's one TanStack Query client. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: ONE_DAY_MS,
    },
  },
})

const router = createRouter({
  context: {
    queryClient,
    session: null,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultStructuralSharing: true,
  routeTree,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const App = () => {
  const { session } = useAuthContext()
  return (
    <NuqsAdapter>
      <RouterProvider router={router} context={{ queryClient, session }} />
    </NuqsAdapter>
  )
}

const AppError = () => (
  <div>
    <p role="alert">Something went wrong.</p>
    <button
      type="button"
      className="zui-button"
      onClick={() => window.location.reload()}
    >
      Reload
    </button>
  </div>
)

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ErrorBoundary fallback={<AppError />}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}
