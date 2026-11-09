import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@mrmartineau/zui/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import {
  ROUTE_APP_HOME,
  ROUTE_FORGOT_PASSWORD,
  ROUTE_SIGNUP,
} from '@/constants'
import { authClient } from '@/lib/auth/client'
import type { FormStatus } from '@/lib/form-status'

/** Email and password sign-in form. */
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle' })
  const navigate = useNavigate()

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus({ kind: 'saving' })

    const { error } = await authClient.signIn.email({ email, password })

    if (error) {
      setStatus({
        kind: 'error',
        message: error.message ?? 'Could not sign in',
      })
      return
    }

    await navigate({ to: ROUTE_APP_HOME })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleLogin} className="flex flex-column gap-md">
          <div className="flex flex-column gap-2xs">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              autoComplete="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="flex flex-column gap-2xs">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to={ROUTE_FORGOT_PASSWORD} className="zui-link">
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              autoComplete="current-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {status.kind === 'error' && (
            <p className="form-error" role="alert">
              {status.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={status.kind === 'saving'}
            style={{ width: '100%' }}
          >
            {status.kind === 'saving' ? 'Logging in...' : 'Login'}
          </Button>
          <div className="form-link">
            Don&apos;t have an account?{' '}
            <Link to={ROUTE_SIGNUP} className="zui-link">
              Sign up
            </Link>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
