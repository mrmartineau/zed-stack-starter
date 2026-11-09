import type { AuthEnv } from '@/lib/auth/server'
import type { HyperdriveBinding } from '../../db/client'

interface AssetBinding {
  fetch: (request: Request) => Promise<Response>
}

/** Every binding and env var the worker reads. */
export type WorkerEnv = Cloudflare.Env &
  AuthEnv & {
    ASSETS?: AssetBinding
    DATABASE_URL?: string
    HYPERDRIVE?: HyperdriveBinding
  }
