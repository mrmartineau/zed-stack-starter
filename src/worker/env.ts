import type { AuthEnv } from "@/lib/auth/server";
import type { HyperdriveBinding } from "../../db/client";

type AssetBinding = {
  fetch: (request: Request) => Promise<Response>;
};

export type WorkerEnv = Cloudflare.Env &
  AuthEnv & {
    ASSETS?: AssetBinding;
    DATABASE_URL?: string;
    HYPERDRIVE?: HyperdriveBinding;
  };
