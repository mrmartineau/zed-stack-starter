import { createFileRoute } from "@tanstack/react-router";
import { UpdatePasswordForm } from "@/components/update-password-form";

export const Route = createFileRoute("/_public/update-password")({
  component: UpdatePassword,
});

function UpdatePassword() {
  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
