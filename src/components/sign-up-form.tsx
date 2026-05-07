import { Button, Card, CardBody, CardDescription, CardHeader, CardTitle, Input, Label } from "@mrmartineau/zui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ROUTE_APP_HOME } from "@/constants";
import { authClient } from "@/lib/auth/client";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);

    const { error } = await authClient.signUp.email({
      email,
      name: name || email,
      password,
    });

    if (error) {
      setError(error.message ?? "Could not sign up");
      setIsLoading(false);
      return;
    }

    await navigate({ to: ROUTE_APP_HOME });
    setIsLoading(false);
  };

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
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-column gap-2xs">
            <Label htmlFor="repeat-password">Repeat Password</Label>
            <Input
              id="repeat-password"
              type="password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" disabled={isLoading} style={{ width: "100%" }}>
            {isLoading ? "Creating an account..." : "Sign up"}
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
