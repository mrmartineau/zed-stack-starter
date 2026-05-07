import type { AuthEnv } from "@/lib/auth/server";

type AssetBinding = {
  fetch: (request: Request) => Promise<Response>;
};

export type WorkerEnv = Cloudflare.Env &
  AuthEnv & {
    ASSETS?: AssetBinding;
    DATABASE_URL?: string;
  };
