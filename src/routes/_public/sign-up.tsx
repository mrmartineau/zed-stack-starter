import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/components/sign-up-form";

export const Route = createFileRoute("/_public/sign-up")({
  component: SignUp,
});

function SignUp() {
  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        <SignUpForm />
      </div>
    </div>
  );
}
