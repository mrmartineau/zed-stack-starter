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
import { ROUTE_APP_HOME, ROUTE_SIGNIN } from '@/constants'
import { authClient } from '@/lib/auth/client'
import type { FormStatus } from '@/lib/form-status'

/** Sign-up form. Checks the two passwords match before it sends. */
export function SignUpForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle' })
  const navigate = useNavigate()

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== repeatPassword) {
      setStatus({ kind: 'error', message: 'Passwords do not match' })
      return
    }
    setStatus({ kind: 'saving' })

    const { error } = await authClient.signUp.email({
      email,
      name: name || email,
      password,
    })

    if (error) {
      setStatus({
        kind: 'error',
        message: error.message ?? 'Could not sign up',
      })
      return
    }

    await navigate({ to: ROUTE_APP_HOME })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign up</CardTitle>
        <CardDescription>Create a new account</CardDescription>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSignUp} className="flex flex-column gap-md">
          <div className="flex flex-column gap-2xs">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              autoComplete="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              autoComplete="new-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="flex flex-column gap-2xs">
            <Label htmlFor="repeat-password">Repeat Password</Label>
            <Input
              id="repeat-password"
              autoComplete="new-password"
              type="password"
              required
              value={repeatPassword}
              onChange={(event) => setRepeatPassword(event.target.value)}
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
            {status.kind === 'saving' ? 'Creating an account...' : 'Sign up'}
          </Button>
          <div className="form-link">
            Already have an account?{' '}
            <Link to={ROUTE_SIGNIN} className="zui-link">
              Login
            </Link>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
