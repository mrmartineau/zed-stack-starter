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
import { Link } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import { ROUTE_SIGNIN, ROUTE_UPDATE_PASSWORD } from '@/constants'
import { authClient } from '@/lib/auth/client'

/** Form that sends a password reset email. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}${ROUTE_UPDATE_PASSWORD}`,
    })

    if (error) {
      setError(error.message ?? 'Could not send reset email')
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>Password reset instructions sent</CardDescription>
        </CardHeader>
        <CardBody>
          <p>
            If you registered using your email and password, you will receive a
            password reset email.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>
          Type in your email and we&apos;ll send you a link to reset your
          password
        </CardDescription>
      </CardHeader>
      <CardBody>
        <form
          onSubmit={handleForgotPassword}
          className="flex flex-column gap-md"
        >
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
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? 'Sending...' : 'Send reset email'}
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
