# Database guide

How to add, modify, and work with database tables in this repo.

- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Driver**: `@neondatabase/serverless` (Postgres wire over HTTP — Workers-compatible)
- **Migration tool**: [drizzle-kit](https://orm.drizzle.team/docs/kit-overview)
- **Single source of truth**: [`db/schema.ts`](../db/schema.ts)
- **Generated SQL**: [`drizzle/`](../drizzle/) — committed, never hand-edited

## Mental model

You write **TypeScript** in `db/schema.ts`. drizzle-kit diffs your schema against the last generated snapshot in `drizzle/meta/` and emits a numbered SQL file. You commit both. `db:migrate` plays unapplied SQL against `DATABASE_URL`.

```
db/schema.ts            ← edit this
      │
      │  bun run db:generate
      ▼
drizzle/0001_xxx.sql    ← generated, commit
drizzle/meta/_journal   ← generated, commit
      │
      │  bun run db:migrate
      ▼
   Postgres
```

## Commands

| Command | What it does |
| --- | --- |
| `bun run db:generate` | Diff `schema.ts` vs last snapshot → emit a new SQL file in `drizzle/`. |
| `bun run db:migrate` | Apply unapplied SQL files to `DATABASE_URL`. |
| `bun run db:studio` | Open Drizzle Studio in the browser (table browser + ad-hoc queries). |

`DATABASE_URL` must be set in `.env` for any of these to work. Migrations target whatever DB that URL points at — be careful pointing it at staging/prod.

## Conventions used in this repo

Look at `db/schema.ts` before adding anything; copy the patterns already there.

- **Field order in `pgTable`**: alphabetical inside the column object. Biome won't enforce this — keep it consistent by hand.
- **Naming**: TS field is camelCase; DB column is snake_case (`createdAt` → `"created_at"`). Always pass an explicit column name as the first arg to the column helper.
- **Primary keys**:
  - User-owned tables joining to `authUsers`: `uuid("id")` with `defaultRandom()`.
  - better-auth-generated tables that need text IDs: `text("id").primaryKey().default(sql\`gen_random_uuid()::text\`)`.
- **Timestamps**: `timestamp("...", { withTimezone: true })`. Use `.defaultNow()` for `created_at`. Add `updated_at` if you'll mutate rows.
- **Foreign keys**: `.references(() => authUsers.id, { onDelete: "cascade" })`. Pick `cascade`, `set null`, or `restrict` deliberately.
- **Indexes & constraints**: declared in the third arg of `pgTable` as an array. Use `index`, `uniqueIndex`, `check` from `drizzle-orm/pg-core`.
- **Auth tables (`authUsers`, `authSessions`, `authAccounts`, `authVerifications`, `authJwks`)** are owned by better-auth. Don't change their shape unless you're upgrading better-auth and the upstream schema changed.

## Add a new table

1. Edit `db/schema.ts`. Add imports as needed from `drizzle-orm/pg-core`.

   ```ts
   export const widgets = pgTable(
     "widgets",
     {
       createdAt: timestamp("created_at", { withTimezone: true })
         .notNull()
         .defaultNow(),
       id: uuid("id").primaryKey().defaultRandom(),
       name: text("name").notNull(),
       ownerId: uuid("owner_id")
         .notNull()
         .references(() => authUsers.id, { onDelete: "cascade" }),
       updatedAt: timestamp("updated_at", { withTimezone: true })
         .notNull()
         .defaultNow(),
     },
     (table) => [
       index("widgets_owner_id_idx").on(table.ownerId),
       uniqueIndex("widgets_owner_id_name_key").on(table.ownerId, table.name),
     ],
   );
   ```

2. `bun run db:generate`. New file appears in `drizzle/`, e.g. `0001_<adjective_noun>.sql`.

3. **Inspect the SQL.** Verify it only does what you expect:
   - `CREATE TABLE` statements only.
   - No `DROP`, no `ALTER ... DROP`, no `RENAME` you didn't intend.

4. `bun run db:migrate` to apply locally.

5. Commit `db/schema.ts` + the new SQL file + `drizzle/meta/` updates together. Reviewing the SQL diff is the safety net for the next person.

## Modify an existing table

drizzle-kit handles most changes automatically. Some are safe; some need extra care.

### Safe — generates clean ALTERs

- Add a nullable column.
- Add a column with a `DEFAULT`.
- Add an index or unique constraint (note: `CREATE UNIQUE INDEX` fails on existing duplicates — clean data first).
- Add a `CHECK` constraint (also validates existing rows — clean first).
- Drop an index.
- Widen a type (`varchar(50)` → `text`).

Workflow: edit `schema.ts`, `bun run db:generate`, inspect, `bun run db:migrate`.

### Needs care — multi-step

- **Add `NOT NULL` column to a populated table.** drizzle-kit will emit `ALTER TABLE ... ADD COLUMN ... NOT NULL` which fails if rows exist. Two options:
  1. Add as nullable first → backfill → set NOT NULL in a follow-up migration.
  2. Add with a `DEFAULT` so existing rows get a value.
- **Rename a column or table.** drizzle-kit's diff sees a rename as `DROP` + `CREATE` — data loss. drizzle-kit will prompt; choose "rename" interactively or hand-edit the generated SQL to `ALTER ... RENAME`. Confirm with the user before doing this.
- **Change a type incompatibly** (e.g. `text` → `uuid`). Generated SQL will need a `USING ...::uuid` clause. Hand-edit the SQL after generation.
- **Tighten a `CHECK` or add a unique index** on a populated table. Validate / clean data first or migration fails halfway.

### Always destructive — confirm with the user before generating

- Dropping a column.
- Dropping a table.
- Removing a `NOT NULL` (usually fine, but signal it).
- Switching a primary key.

If you see any of these in `bun run db:generate`'s output and didn't intend them, **stop**, revert your `schema.ts` edit, and figure out why drizzle-kit thinks they're needed (often: you typoed a column name and it's seeing a rename as drop+create).

## Hand-editing generated SQL

Sometimes you have to. drizzle-kit's diff is structural — it doesn't know your data. Edit the SQL file before running `db:migrate`:

- Splitting a destructive change into safe sub-steps.
- Adding `USING` clauses to `ALTER COLUMN ... TYPE`.
- Backfilling with `UPDATE` between an `ADD COLUMN` and `SET NOT NULL`.
- Wrapping risky changes in `BEGIN; ... COMMIT;` (drizzle-kit applies each statement independently — wrap manually if you need atomicity).

After editing, **don't re-run `db:generate`** until you've migrated. drizzle-kit re-derives the snapshot from the schema, not the SQL — but `meta/_journal.json` already references the file, so editing it is fine; deleting and regenerating is not.

## Querying

Server-side, inside a Hono handler — use the `db` already on the request context:

```ts
import { eq } from "drizzle-orm";
import { widgets } from "../../db/schema";
import { requireRequestContext } from "./context";

app.get("/widgets", async (c) => {
  const ctx = await requireRequestContext(c);
  if (ctx instanceof Response) return ctx;
  const rows = await ctx.db
    .select()
    .from(widgets)
    .where(eq(widgets.ownerId, ctx.user.id));
  return c.json(rows);
});
```

Outside of a request, build a client manually:

```ts
import { createDb } from "../../db/client";
const db = createDb(env);
```

For inserts / updates / deletes, follow Drizzle docs — `db.insert(widgets).values({...}).returning()`, `db.update(widgets).set({...}).where(...)`, etc.

## Inspecting & debugging

- `bun run db:studio` — Drizzle Studio, table browser + SQL console.
- `psql "$DATABASE_URL"` — raw psql against Neon (Neon supports psql even on free tier).
- Failed migration leaves Postgres in whatever state the failing statement got to. Inspect with `\d table_name` in psql, fix data or hand-edit the SQL, re-run `db:migrate`.

## Resetting local DB

Neon: drop and recreate the branch (or use a new database) via the Neon console, point `DATABASE_URL` at it, `bun run db:migrate`. Don't try to "rollback" individual migrations — drizzle-kit's migrator is forward-only.

## Switching off Neon

`@neondatabase/serverless` is just a Postgres wire client over HTTP. To use plain Postgres (RDS, Supabase, local Docker, Hyperdrive):

1. Edit `db/client.ts` — swap to `drizzle-orm/node-postgres` + `pg.Pool`.
2. Keep `nodejs_compat` in `wrangler.jsonc` (already on).
3. For Hyperdrive: bind it in `wrangler.jsonc`, read `env.HYPERDRIVE.connectionString`.

Schema and migrations don't change.

## Production migrations

`bun run db:migrate` works against whatever `DATABASE_URL` is set in the shell. To apply to prod:

```bash
DATABASE_URL='postgresql://...prod...' bun run db:migrate
```

This is destructive scope — confirm with a human before running. `wrangler deploy` does **not** run migrations; you have to do it explicitly.
