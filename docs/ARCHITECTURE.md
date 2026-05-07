# Architecture

How the pieces fit together.

## Request lifecycle

```
Browser → Cloudflare Worker (Hono)
            ├── /api/auth/*  → better-auth handler → Drizzle → Postgres
            ├── /api/me      → requireRequestContext → Drizzle → Postgres
            └── /*           → ASSETS binding (SPA)
```

1. Browser hits Worker URL
2. If path starts with `/api`, Hono routes it
3. `/api/auth/*` is mounted to better-auth's handler — it owns sign-in, sign-up, sessions, JWT, password reset endpoints
4. App routes (`/api/me`) call `requireRequestContext(c)` which:
   - Constructs Drizzle client from `DATABASE_URL`
   - Reads cookie session via `auth.api.getSession(headers)`
   - Falls back to `Authorization: Bearer <api_key>` if no cookie
   - Returns 401 if neither
5. Static asset paths fall through to `assets` binding — `index.html` for SPA routes

## Auth model

### Tables

- `user` — id (uuid), email, name, emailVerified, image
- `session` — token, expires_at, user_id (FK), userAgent, ipAddress
- `account` — provider linkages (email/password creds live here as `password` column when `providerId='credential'`)
- `verification` — email verification + password reset tokens
- `jwks` — signing keys for issued JWTs
- `profiles` — app-specific user data: `id` (FK to user), `username`, `avatar_url`, `api_key` (UUID), `updated_at`

### Why split user vs profiles?

`user` is owned by better-auth — its schema is fixed. App-level fields (settings, API key, etc.) go in `profiles`. The `databaseHooks.user.create.after` callback in `src/lib/auth/server.ts` inserts a `profiles` row whenever a `user` is created.

### Sessions

Cookie-based. Better-auth signs sessions with `BETTER_AUTH_SECRET`. Session token is opaque; lookup hits the `session` table on every request. Use `nodejs_compat` so bcrypt/crypto Node APIs work in the Worker.

### API keys

Every profile has an `api_key` (UUID, unique). Pass as `Authorization: Bearer <uuid>`. `createRequestContext` checks this if no cookie session — useful for CLI tools, mobile apps, integrations.

## Database driver choice

`@neondatabase/serverless` with the `drizzle-orm/neon-http` adapter:

- HTTP-based — no TCP socket lifecycle to manage in short-lived Worker isolates
- Neon proxies pool connections server-side
- One round-trip per query (no transaction state across statements)

If you need multi-statement transactions, swap to `neon-serverless` (WebSocket mode) or `pg` Pool with Hyperdrive.

## Frontend state

```
QueryClientProvider
  └── AuthProvider           # wraps authClient.useSession()
       └── RouterProvider     # context: {queryClient, session}
```

- **Session** — `authClient.useSession()` is reactive; updates on sign-in/sign-out without manual invalidation
- **Profile** — `getUserProfileOptions()` is a TanStack Query that fetches `/api/me`. Mutations use optimistic updates against the `['userProfile']` key
- **Protected routes** — `_authed/route.tsx` calls `getSession()` in `beforeLoad`, throws `redirect({to: '/login'})` if absent

## File ownership

| File                              | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| `db/schema.ts`                    | Single source of truth for DB shape               |
| `db/client.ts`                    | Drizzle factory — one `createDb(env)` per request |
| `src/lib/auth/server.ts`          | better-auth config + Drizzle adapter wiring       |
| `src/lib/auth/client.ts`          | React `authClient` for browser                    |
| `src/worker/context.ts`           | Server-side request auth + DB factory             |
| `src/worker/hono.ts`              | API route table                                   |
| `src/components/AuthProvider.tsx` | Reactive session context                          |
| `src/lib/fetching/user.ts`        | Session + profile React Query options + mutations |

## Adding a new authenticated endpoint

1. Define handler in `src/worker/myresource.ts`:

```ts
import type { Context } from "hono";
import { requireRequestContext } from "./context";
import type { WorkerEnv } from "./env";

export const listMyThings = async (c: Context<{ Bindings: WorkerEnv }>) => {
  const ctx = await requireRequestContext(c);
  if (ctx instanceof Response) return ctx;

  const rows = await ctx.db.select().from(myTable).where(eq(myTable.userId, ctx.user.id));
  return Response.json({ data: rows });
};
```

2. Wire in `src/worker/hono.ts`:

```ts
app.get("/things", listMyThings);
```

3. Consume from React via TanStack Query:

```ts
const { data } = useQuery({
  queryKey: ["things"],
  queryFn: async () => (await fetch("/api/things", { credentials: "include" })).json(),
});
```
