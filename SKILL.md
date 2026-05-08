---
name: zed-stack-starter
description: Extend the zed-stack-starter app — add routes, API endpoints, DB tables, components. Use when working in this repo and asked to add a page, route, /api handler, schema/table, migration, env var, or auth-guarded screen. Triggers on "add route", "new endpoint", "drizzle table", "protected page", "TanStack Router file route", "Hono handler", "better-auth".
---

# zed-stack-starter

Skill for extending this repo. Pair with [`AGENTS.md`](./AGENTS.md) for full conventions.

## Stack snapshot

React 19 + TanStack Router (file-based) + TanStack Query + Hono on Cloudflare Workers + Drizzle + Postgres (Neon HTTP) + better-auth + ZUI. Bun. Biome. Vitest.

## Hard rules (do not violate)

- Never edit `src/routeTree.gen.ts`, `drizzle/*.sql`, or `worker-configuration.d.ts` by hand. They are generated.
- Never hard-code route paths in JSX — use `ROUTE_*` constants from `src/constants.ts`. Add a constant when adding a top-level route.
- Authed Hono handlers must call `requireRequestContext(c)` and return early if it's a `Response`.
- ZUI classes only for styling. No CSS-in-JS, no extra UI libraries.
- Use the `@/` alias for `src/` imports.

## Routing map

```
src/routes/
├── __root.tsx              app shell (every URL)
├── index.tsx               /
├── _public/                pathless layout — unauthenticated pages
│   ├── route.tsx
│   ├── login.tsx           /login
│   ├── sign-up.tsx         /sign-up
│   ├── forgot-password.tsx
│   ├── update-password.tsx
│   └── sign-up-success.tsx
└── _authed/                pathless layout — guarded by getSession() in beforeLoad
    ├── route.tsx           redirect to /login if no session
    └── app/                pages live at /app/*
```

To add a protected page at `/app/foo`, create `src/routes/_authed/app/foo.tsx`. Auth is inherited from the parent layout — don't reimplement it.

## Recipe — add a route

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

If linked from JSX elsewhere, add to `src/constants.ts`:

```ts
export const ROUTE_ABOUT = "/about";
```

…and link with `<Link to={ROUTE_ABOUT}>About</Link>` (import `Link` from `@tanstack/react-router`).

## Recipe — add an API endpoint

Inline in `src/worker/hono.ts` for one-offs:

```ts
app.get("/widgets", async (c) => {
  const ctx = await requireRequestContext(c);
  if (ctx instanceof Response) return ctx;
  const rows = await ctx.db.select().from(widgets).where(eq(widgets.ownerId, ctx.user.id));
  return c.json(rows);
});
```

For a feature with multiple handlers, mirror `src/worker/profile.ts` — export named handlers from `src/worker/<feature>.ts`, register them in `hono.ts`.

`requireRequestContext` returns `Response` (401) or `{db, user, profile}`. `createRequestContext` is the optional-auth variant.

## Recipe — add or modify a DB table

Full guide: [`docs/DATABASE.md`](./docs/DATABASE.md). Skim it before non-trivial schema work — it covers safe vs. destructive migrations, renames, hand-editing SQL.

Add a table:

```ts
// db/schema.ts
import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { authUsers } from "./schema"; // already in this file

export const widgets = pgTable(
  "widgets",
  {
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("widgets_owner_id_idx").on(table.ownerId),
    uniqueIndex("widgets_owner_id_name_key").on(table.ownerId, table.name),
  ],
);
```

Then:

1. `bun run db:generate` — emits SQL in `drizzle/`.
2. Inspect the SQL. **Stop and ask the user** if you see any unexpected `DROP`, `ALTER ... DROP COLUMN`, or rename — drizzle-kit sees renames as drop+create unless you tell it otherwise.
3. Hand-edit the SQL when needed (backfill before `SET NOT NULL`, `USING` clauses on type changes, split destructive changes). Don't re-run `db:generate` before `db:migrate` after a hand-edit.
4. `bun run db:migrate` locally.
5. Commit `db/schema.ts` + new SQL + `drizzle/meta/` updates together.

Conventions in this repo:
- Alphabetical field order inside `pgTable` column object.
- camelCase TS field, explicit snake_case column name (`createdAt: timestamp("created_at", ...)`).
- `timestamp(..., { withTimezone: true })` always.
- FKs: explicit `onDelete` (`cascade` / `set null` / `restrict`).
- Indexes/checks declared in the third arg as an array.

Never run migrations against a non-local DB without explicit user instruction.

## Recipe — query the DB

Inside a Hono handler, use the `db` already on the request context. Outside, build one:

```ts
import { eq } from "drizzle-orm";
import { createDb } from "../../db/client";
import { widgets } from "../../db/schema";

const db = createDb(env);
const [w] = await db.select().from(widgets).where(eq(widgets.id, id));
```

## Recipe — client data fetching

`QueryClient` is set up in `src/main.tsx`.

```tsx
import { useQuery } from "@tanstack/react-query";

const { data } = useQuery({
  queryKey: ["widgets"],
  queryFn: () => fetch("/api/widgets").then((r) => r.json()),
});
```

For session/profile, use helpers in `src/lib/fetching/user.ts` — don't duplicate.

## Recipe — env var

1. `.env` for local.
2. `wrangler.jsonc` `vars` (non-secret) or `bunx wrangler secret put NAME` (secret) — ask the user before running this against a remote env.
3. Add to `WorkerEnv` in `src/worker/env.ts`.
4. `bun run cf-typegen` if you added a new binding type (KV, D1, etc.), not for plain string vars.

## Pre-handoff checklist

1. `bun run check` (Biome).
2. `bun run type-check` (tsc).
3. `bun run test` if anything tested was touched.
4. New route → `ROUTE_*` constant added if linked from JSX.
5. Schema change → matching SQL file committed in `drizzle/`.
6. No hand-edits to generated files.

## Ask before doing

- Destructive migrations.
- `bun run deploy`.
- `wrangler secret put` on a non-local env.
- Adding a new top-level dependency.
- Switching the DB driver.
