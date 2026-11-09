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
import { useNavigate, useSearch } from '@tanstack/react-router'
import { type FormEvent, useState } from 'react'
import { ROUTE_APP_HOME } from '@/constants'
import { authClient } from '@/lib/auth/client'
import type { FormStatus } from '@/lib/form-status'

/** Sets a new password from the `token` in the reset link. */
export function UpdatePasswordForm() {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<FormStatus>({ kind: 'idle' })
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { token?: string }

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus({ kind: 'saving' })

    if (!search.token) {
      setStatus({ kind: 'error', message: 'Missing reset token' })
      return
    }

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token: search.token,
    })

    if (error) {
      setStatus({
        kind: 'error',
        message: error.message ?? 'Could not update password',
      })
      return
    }

    await navigate({ to: ROUTE_APP_HOME })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>Please enter your new password below.</CardDescription>
      </CardHeader>
      <CardBody>
        <form
          onSubmit={handleUpdatePassword}
          className="flex flex-column gap-md"
        >
          <div className="flex flex-column gap-2xs">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              autoComplete="new-password"
              type="password"
              placeholder="New password"
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
            {status.kind === 'saving' ? 'Saving...' : 'Save new password'}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
