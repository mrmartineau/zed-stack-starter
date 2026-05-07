import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/login-form";

export const Route = createFileRoute("/_public/login")({
  component: Login,
});

function Login() {
  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        <LoginForm />
      </div>
    </div>
  );
}
