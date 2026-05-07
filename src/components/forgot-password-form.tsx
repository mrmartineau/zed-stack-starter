import { Button, Card, CardBody, CardDescription, CardHeader, CardTitle, Input, Label } from "@mrmartineau/zui/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/auth/forget-password", {
      body: JSON.stringify({
        email,
        redirectTo: `${window.location.origin}/update-password`,
      }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      setError(body.message ?? "Could not send reset email");
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>Password reset instructions sent</CardDescription>
        </CardHeader>
        <CardBody>
          <p>
            If you registered using your email and password, you will receive a password reset email.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>
          Type in your email and we&apos;ll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleForgotPassword} className="flex flex-column gap-md">
          <div className="flex flex-column gap-2xs">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" disabled={isLoading} style={{ width: "100%" }}>
            {isLoading ? "Sending..." : "Send reset email"}
          </Button>
          <div className="form-link">
            Already have an account?{" "}
            <Link to="/login" className="zui-link">
              Login
            </Link>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
