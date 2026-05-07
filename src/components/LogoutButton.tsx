import { SignOutIcon } from "@phosphor-icons/react";
import { Button } from "@mrmartineau/zui/react";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { CONTENT, ROUTE_SIGNIN } from "../constants";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut();
    navigate({ to: ROUTE_SIGNIN });
  };

  return (
    <Button variant="ghost" onClick={handleLogout}>
      <SignOutIcon aria-label="Sign out" size={18} weight="duotone" />
      {CONTENT.signOutNav}
    </Button>
  );
}
