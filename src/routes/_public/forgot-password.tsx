import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const Route = createFileRoute("/_public/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
