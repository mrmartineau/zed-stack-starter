import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/components/login-form'
import { createTitle } from '@/lib/create-title'

export const Route = createFileRoute('/_public/login')({
  component: Login,
  head: () => ({ meta: [{ title: createTitle('signInTitle') }] }),
})

function Login() {
  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        <LoginForm />
      </div>
    </div>
  )
}
