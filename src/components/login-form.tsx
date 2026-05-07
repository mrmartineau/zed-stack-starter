import { Button, Card, CardBody, CardDescription, CardHeader, CardTitle, Input, Label } from "@mrmartineau/zui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ROUTE_APP_HOME } from "@/constants";
import { authClient } from "@/lib/auth/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await authClient.signIn.email({ email, password });

    if (error) {
      setError(error.message ?? "Could not sign in");
      setIsLoading(false);
      return;
    }

    await navigate({ to: ROUTE_APP_HOME });
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleLogin} className="flex flex-column gap-md">
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
          <div className="flex flex-column gap-2xs">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="zui-link">
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" disabled={isLoading} style={{ width: "100%" }}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <div className="form-link">
            Don&apos;t have an account?{" "}
            <Link to="/sign-up" className="zui-link">
              Sign up
            </Link>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
