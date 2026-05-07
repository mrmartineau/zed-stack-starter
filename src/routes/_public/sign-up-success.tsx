import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@mrmartineau/zui/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/sign-up-success")({
  component: SignUpSuccess,
});

function SignUpSuccess() {
  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        <Card>
          <CardHeader>
            <CardTitle>Thank you for signing up!</CardTitle>
            <CardDescription>Check your email to confirm</CardDescription>
          </CardHeader>
          <CardBody>
            <p>
              You&apos;ve successfully signed up. Please check your email to confirm your account
              before signing in.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
