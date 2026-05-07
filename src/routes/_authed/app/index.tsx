import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getUserProfileOptions } from "@/lib/fetching/user";

export const Route = createFileRoute("/_authed/app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: debug } = useQuery({
    queryFn: async () => {
      const res = await fetch("/api");
      if (!res.ok) throw new Error("Failed to fetch debug info");
      return (await res.text()) as string;
    },
    queryKey: ["debug"],
  });

  const { data: user } = useQuery(getUserProfileOptions());

  return (
    <>
      <p>Hello {user?.data?.username}</p>
      <p>Debug: {debug}</p>
    </>
  );
}
