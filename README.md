# Z Stack Starter

Modern full-stack React starter. Postgres + better-auth + Drizzle ORM, deployed to Cloudflare Workers.

## Tech Stack

| Category                 | Technology                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------- |
| **Framework**            | [React 19](https://react.dev/)                                                         |
| **Routing**              | [TanStack Router](https://tanstack.com/router)                                         |
| **Data Fetching**        | [TanStack Query](https://tanstack.com/query)                                           |
| **Auth**                 | [better-auth](https://www.better-auth.com/)                                            |
| **Database**             | Any Postgres (default: [Neon](https://neon.tech/))                                     |
| **ORM**                  | [Drizzle ORM](https://orm.drizzle.team/)                                               |
| **DB Driver**            | [@neondatabase/serverless](https://neon.tech/docs/serverless/serverless-driver) (HTTP) |
| **API Server**           | [Hono](https://hono.dev/)                                                              |
| **Deployment**           | [Cloudflare Workers](https://workers.cloudflare.com/)                                  |
| **Styling**              | [Tailwind CSS v4](https://tailwindcss.com/)                                            |
| **UI Components**        | [shadcn/ui](https://ui.shadcn.com/)                                                    |
| **Validation**           | [Zod](https://zod.dev/)                                                                |
| **Linting & Formatting** | [Biome](https://biomejs.dev/)                                                          |
| **Testing**              | [Vitest](https://vitest.dev/)                                                          |

## Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- A Postgres database — [Neon](https://neon.tech/) recommended (free tier works)
- A [Cloudflare](https://cloudflare.com/) account (for deployment)

## Quick Start

### 1. Install

```bash
bun install
```

### 2. Provision Postgres

Sign up at [Neon](https://console.neon.tech/), create a project, and copy the **pooled** connection string. It looks like:

```
postgresql://USER:PASSWORD@ep-xxx-pooler.region.aws.neon.tech/DBNAME?sslmode=require
```

> Any Postgres works — Supabase, RDS, Railway, local Docker, etc. Just pass a valid connection string.

### 3. Environment

Copy `.env.example` → `.env` and fill in:

```env
DATABASE_URL=postgresql://...        # from step 2
BETTER_AUTH_SECRET=                  # see below
BETTER_AUTH_URL=http://localhost:3450
```

Generate a secret:

```bash
openssl rand -hex 32
```

### 4. Run migrations

```bash
bun run db:migrate
```

This applies the SQL files in `drizzle/` to your database. Tables created: `user`, `session`, `account`, `verification`, `jwks`, `profiles`.

### 5. Start dev server

```bash
bun run dev
```

App runs at http://localhost:3450.

## Project Structure

```
db/                     # Drizzle schema + client
├── schema.ts           # Auth tables + profiles
└── client.ts           # neon-http drizzle client
drizzle/                # Generated migration SQL
drizzle.config.ts       # Drizzle Kit config
src/
├── components/
│   ├── ui/             # shadcn components
│   ├── AuthProvider.tsx
│   ├── login-form.tsx
│   ├── sign-up-form.tsx
│   ├── forgot-password-form.tsx
│   ├── update-password-form.tsx
│   └── LogoutButton.tsx
├── lib/
│   ├── auth/
│   │   ├── server.ts   # better-auth server config
│   │   └── client.ts   # better-auth React client
│   ├── fetching/
│   │   ├── user.ts     # session + profile queries
│   │   └── errorResponse.ts
│   ├── get-error-message.ts
│   └── utils.ts
├── routes/             # TanStack Router file-based
│   ├── __root.tsx
│   ├── _authed/        # protected
│   ├── _public/        # login / signup / forgot-password
│   └── index.tsx
├── worker/             # Hono on Cloudflare Workers
│   ├── index.ts        # entry
│   ├── hono.ts         # routes
│   ├── env.ts          # typed env bindings
│   ├── context.ts      # request context (session + DB)
│   └── profile.ts      # /api/me endpoints
├── types/db.ts
├── constants.ts
├── main.tsx
└── styles.css
```

## Auth Flow

Email/password via [better-auth](https://www.better-auth.com/):

- **Sign up** — `authClient.signUp.email({email, password, name})`
- **Sign in** — `authClient.signIn.email({email, password})`
- **Sign out** — `authClient.signOut()`
- **Session** — `authClient.useSession()` (live React hook)
- **Forgot password** — POST `/api/auth/forget-password` (server needs `sendResetPassword` configured to actually send mail; see `src/lib/auth/server.ts`)

A `profiles` row is auto-inserted via `databaseHooks.user.create.after` on sign up.

### Protected routes

`src/routes/_authed/route.tsx` calls `getSession()` in `beforeLoad` and redirects to `/login` if missing.

### Server-side auth

`src/worker/context.ts` exposes:

- `createRequestContext(c)` — pulls session from request headers, returns `{db, user, profile}`
- `requireRequestContext(c)` — same, returns 401 Response if no auth

Supports both cookie sessions and `Authorization: Bearer <api_key>` (where `api_key` is the UUID stored in `profiles.api_key`).

## API

Hono mounted at `/api`. Defined in `src/worker/hono.ts`:

```ts
app.on(['GET', 'POST'], '/auth/*', ...)  // better-auth handler
app.get('/me', getCurrentProfile)
app.patch('/me', updateCurrentProfile)
```

Add new routes in `hono.ts`. Use `requireRequestContext(c)` inside handlers needing auth.

## Database

Drizzle ORM with Neon HTTP driver — designed for Workers' edge runtime.

### Editing schema

1. Edit `db/schema.ts`
2. `bun run db:generate` → emits SQL in `drizzle/`
3. Commit the SQL
4. `bun run db:migrate` → applies to your DB

### Querying

```ts
import { eq } from "drizzle-orm";
import { createDb } from "../../db/client";
import { profiles } from "../../db/schema";

const db = createDb(env);
const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId));
```

### Switching databases

The `@neondatabase/serverless` driver speaks Postgres wire protocol over HTTP. To switch off Neon:

- **Self-hosted / RDS / Supabase**: swap `db/client.ts` to `drizzle-orm/node-postgres` + `pg.Pool` (requires `nodejs_compat` flag — already set in `wrangler.jsonc`).
- **Cloudflare Hyperdrive**: bind a Hyperdrive in `wrangler.jsonc`, read its `connectionString`.

## Deployment

### Set secrets

```bash
bunx wrangler secret put DATABASE_URL
bunx wrangler secret put BETTER_AUTH_SECRET
```

Update `BETTER_AUTH_URL` in `wrangler.jsonc` `vars` to your production URL.

### Deploy

```bash
bun run deploy
```

Authenticate first if needed: `bunx wrangler login`.

### Wrangler config

`wrangler.jsonc`:

- `nodejs_compat` flag — required for bcryptjs + better-auth internals
- `assets.not_found_handling: "single-page-application"` — SPA fallback
- `placement.mode: "smart"` — Worker runs near your DB
- `ai.binding: "AI"` — Workers AI available as `env.AI`

## Scripts

| Script                | What it does                            |
| --------------------- | --------------------------------------- |
| `bun run dev`         | Start dev server on port 3450           |
| `bun run build`       | Vite build + tsc                        |
| `bun run preview`     | Preview production build                |
| `bun run deploy`      | Build + `wrangler deploy`               |
| `bun run db:generate` | Generate Drizzle migrations from schema |
| `bun run db:migrate`  | Apply migrations to DATABASE_URL        |
| `bun run db:studio`   | Open Drizzle Studio                     |
| `bun run test`        | Run Vitest                              |
| `bun run type-check`  | TypeScript check                        |
| `bun run cf-typegen`  | Regenerate `worker-configuration.d.ts`  |
| `bun run lint:check`  | Biome check + autofix                   |
| `bun run format`      | Biome format                            |

## Adding shadcn components

```bash
bunx shadcn@latest add button card input
```

Configured in `components.json`.

## Configuration knobs

| Env var                       | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `DATABASE_URL`                | Postgres connection string                     |
| `BETTER_AUTH_SECRET`          | 32+ char random hex; signs sessions            |
| `BETTER_AUTH_URL`             | Public origin (cookies + redirect URLs)        |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Comma-separated. Defaults to `BETTER_AUTH_URL` |
| `BETTER_AUTH_DISABLE_SIGNUP`  | `true` to lock out new sign-ups                |

## License

MIT
