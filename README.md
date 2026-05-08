# Zed Stack Starter

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
| **UI Library**           | [ZUI](https://github.com/mrmartineau/zui) (CSS-first)                                  |
| **Icons**                | [Phosphor Icons](https://phosphoricons.com/)                                           |
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

App runs at http://localhost:3450 (proxied as `[ras.localhost](http://ras.localhost:1355)` via [portless](https://github.com/sidwebworks/portless)).

## Project Structure

```
db/                     # Drizzle schema + client
├── schema.ts           # Auth tables + profiles
└── client.ts           # neon-http drizzle client
drizzle/                # Generated migration SQL
drizzle.config.ts       # Drizzle Kit config
src/
├── components/         # AuthProvider, login/signup/password forms, LogoutButton
├── lib/
│   ├── auth/
│   │   ├── server.ts   # better-auth server config
│   │   └── client.ts   # better-auth React client
│   ├── fetching/
│   │   ├── user.ts     # session + profile queries
│   │   └── errorResponse.ts
│   ├── createTitle.ts
│   └── get-error-message.ts
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
├── reportWebVitals.ts
└── styles.css           # imports @mrmartineau/zui/css
```

## Extending the app

Quick recipes for the most common things you'll want to add. Agents: see [`AGENTS.md`](./AGENTS.md) for the same recipes plus project conventions.

### Add a route

Routes are file-based via [TanStack Router](https://tanstack.com/router). Drop a file into `src/routes` and the route tree (`src/routeTree.gen.ts`) regenerates automatically while `bun run dev` is running.

```tsx
// src/routes/about.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return <h1>About</h1>;
}
```

Folder conventions used here:

- `src/routes/_public/*` — unauthenticated pages (login, sign-up, forgot-password). The `_public` segment is a [pathless layout route](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#pathless-layout-routes), so files inside resolve at `/login`, `/sign-up`, etc.
- `src/routes/_authed/*` — pages behind auth. `_authed/route.tsx` runs `getSession()` in `beforeLoad` and redirects to `/login` when there's no session. Anything under `_authed/` is protected by inheritance.
- `src/routes/_authed/app/*` — the app shell. Files here resolve at `/app/...`.

To add a protected page, create `src/routes/_authed/app/billing.tsx` and it's live at `/app/billing` with auth already enforced by the parent layout.

### Add a link

Use `Link` from `@tanstack/react-router` for SPA navigation. Prefer route constants from `src/constants.ts` rather than hard-coding paths:

```tsx
import { Link } from "@tanstack/react-router";
import { ROUTE_APP_HOME } from "@/constants";

<Link to={ROUTE_APP_HOME}>App</Link>;
```

When you add a new top-level route, add a matching `ROUTE_*` constant so links stay refactor-safe.

### Add a layout

`src/routes/__root.tsx` is the app-wide shell — anything you put there appears on every page, with route content rendered at `<Outlet />`.

For section-level layouts (e.g. an authed sidebar), edit `src/routes/_authed/route.tsx` — its JSX wraps every authed child route.

### Add an API endpoint

Hono is mounted at `/api`. Edit `src/worker/hono.ts`:

```ts
import { requireRequestContext } from "./context";

app.get("/widgets", async (c) => {
  const ctx = await requireRequestContext(c);
  if (ctx instanceof Response) return ctx; // 401
  const { db, user } = ctx;
  const rows = await db.select().from(widgets).where(eq(widgets.ownerId, user.id));
  return c.json(rows);
});
```

`requireRequestContext(c)` returns either `{db, user, profile}` or a 401 `Response`. Use `createRequestContext(c)` instead if the route is optionally authenticated.

For anything bigger than a couple of handlers, extract to its own file in `src/worker/` (see `profile.ts` for the shape) and import it into `hono.ts`.

### Add a database table

1. Edit `db/schema.ts` — add the table with Drizzle's `pgTable`.
2. `bun run db:generate` — emits a new SQL file in `drizzle/`.
3. Commit the SQL.
4. `bun run db:migrate` — applies it to whatever `DATABASE_URL` points at.

Re-run `bun run cf-typegen` only if you change `wrangler.jsonc` bindings — schema changes don't need it.

### Add data fetching with TanStack Query

The QueryClient is already provided in `src/main.tsx`. Use `useQuery` directly in a component, or call it from inside a route loader to prefetch.

```tsx
import { useQuery } from "@tanstack/react-query";

function Widgets() {
  const { data } = useQuery({
    queryKey: ["widgets"],
    queryFn: () => fetch("/api/widgets").then((r) => r.json()),
  });
  return <ul>{data?.map((w) => <li key={w.id}>{w.name}</li>)}</ul>;
}
```

For session-aware data, see `src/lib/fetching/user.ts` for the existing `getSession()` / profile patterns.

### Add a component

Plain React components live in `src/components/`. UI primitives come from [ZUI](https://github.com/mrmartineau/zui) — use `zui-button`, `zui-card`, `zui-input` classes on regular HTML elements rather than wrapping anything. Tokens (`--space-*`, `--color-*`, `--step-*`) are CSS custom properties, available in any stylesheet.

### Add an environment variable

1. Add to `.env` for local dev.
2. Add to `wrangler.jsonc` `vars` (non-secret) or `bunx wrangler secret put NAME` (secret).
3. Add to `WorkerEnv` in `src/worker/env.ts` so it's typed inside Hono handlers.
4. Run `bun run cf-typegen` to refresh `worker-configuration.d.ts`.

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

Drizzle ORM with Neon HTTP driver — designed for Workers' edge runtime. Full guide in [`docs/DATABASE.md`](./docs/DATABASE.md): conventions, safe vs. destructive migrations, hand-editing SQL, switching providers, prod migrations.

### Editing schema

1. Edit `db/schema.ts`
2. `bun run db:generate` → emits SQL in `drizzle/`
3. Inspect the SQL — stop if it drops or renames anything you didn't intend
4. Commit `db/schema.ts` + the SQL + `drizzle/meta/` together
5. `bun run db:migrate` → applies to your DB

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
| `bun run check`       | Biome check + autofix                   |
| `bun run format`      | Biome format                            |

## Styling

[ZUI](https://github.com/mrmartineau/zui) is a CSS-first component + token library. Imported once in `src/styles.css`:

```css
@import "@mrmartineau/zui/css";
```

Components are plain elements with `zui-*` classes (`zui-button`, `zui-card`, `zui-input`, etc.) — no JS wrappers, no build step. Design tokens (`--space-*`, `--color-*`, `--step-*`) are exposed as CSS custom properties.

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
