import { Button, Card, CardBody, CardDescription, CardHeader, CardTitle, Input, Label } from "@mrmartineau/zui/react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { ROUTE_APP_HOME } from "@/constants";
import { authClient } from "@/lib/auth/client";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { token?: string };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!search.token) {
      setError("Missing reset token");
      setIsLoading(false);
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword: password,
      token: search.token,
    });

    if (error) {
      setError(error.message ?? "Could not update password");
      setIsLoading(false);
      return;
    }

    await navigate({ to: ROUTE_APP_HOME });
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>Please enter your new password below.</CardDescription>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleUpdatePassword} className="flex flex-column gap-md">
          <div className="flex flex-column gap-2xs">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="New password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" disabled={isLoading} style={{ width: "100%" }}>
            {isLoading ? "Saving..." : "Save new password"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
