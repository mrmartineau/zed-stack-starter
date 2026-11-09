# Setup Guide

Step-by-step setup for a fresh Z Stack Starter project. ~10 minutes.

## 1. Clone & install

```bash
git clone <this-repo> my-app
cd my-app
pnpm install
```

## 2. Provision Postgres (Neon)

1. Go to https://console.neon.tech/ and sign in
2. Create a new project (any region — pick one close to your Cloudflare deploy)
3. After creation, find **Connection string** and turn **Connection pooling** off. In production, Hyperdrive does the pooling. Local dev has no pooling and opens one connection per request.
4. Copy the string. Format:

   ```
   postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

> Other Postgres options: Supabase (use the **direct connection** string), Railway, Fly Postgres, RDS, local `docker run postgres`.

## 3. Generate auth secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the 64-char hex output.

## 4. Local env

Copy the example:

```bash
cp .env.example .env
```

Fill in:

```env
DATABASE_URL=postgresql://USER:PASS@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE=postgresql://USER:PASS@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=<paste 64-char hex from step 3>
BETTER_AUTH_URL=http://localhost:3450
```

`DATABASE_URL` is for drizzle-kit. The Worker reads the second one in local dev, in place of the Hyperdrive binding.

## 5. Apply schema to DB

```bash
pnpm run db:migrate
```

This runs the SQL files in `drizzle/` against `DATABASE_URL`. You should see 6 tables created:

- `user`, `session`, `account`, `verification`, `jwks` (better-auth)
- `profiles` (app-level user data)

Verify with Drizzle Studio:

```bash
pnpm run db:studio
```

## 6. Start dev server

```bash
pnpm run dev
```

Open http://localhost:3450.

## 7. Create your first user

1. Visit http://localhost:3450/sign-up
2. Enter email, name, password
3. You're redirected to `/app` — protected route now accessible

The `databaseHooks.user.create.after` callback in `src/lib/auth/server.ts` automatically creates a matching `profiles` row.

## 8. Cloudflare deploy

### Authenticate

```bash
pnpm exec wrangler login
```

### Create the Hyperdrive config

```bash
# Paste the connection string at the prompt. `read -s` keeps it off the
# screen and out of your shell history. (bash or zsh; printf, not read -p,
# because zsh's read -p means something else.)
printf 'Connection string: '; read -rs DB_URL; printf '\n'
pnpm exec wrangler hyperdrive create zed-stack-starter-db --connection-string="$DB_URL"
unset DB_URL
```

Or create it in the Cloudflare dashboard: **Storage & Databases → Hyperdrive**.

Put the returned `id` in the `hyperdrive` block of `wrangler.jsonc`. The Worker reads the database through this binding, so it needs no `DATABASE_URL` secret.

Use a separate Neon branch or database for prod. Don't reuse dev.

### Set production secrets

```bash
pnpm exec wrangler secret put BETTER_AUTH_SECRET
```

### Update public URL

Edit `wrangler.jsonc`:

```jsonc
"vars": {
  "BETTER_AUTH_URL": "https://your-app.your-subdomain.workers.dev"
}
```

Or set per-environment using `[env.production]` blocks.

### Deploy

```bash
pnpm run deploy
```

Wrangler builds + uploads the Worker + assets. Visit the printed URL.

## 9. Custom domain (optional)

1. Cloudflare Dashboard → Workers & Pages → your worker → **Settings** → **Triggers**
2. Add Custom Domain → enter `app.example.com`
3. Update `BETTER_AUTH_URL` in `wrangler.jsonc` to the new origin
4. Redeploy

## Common tasks

### Add a new column

1. Edit `db/schema.ts`
2. `pnpm run db:generate`
3. Inspect the new file in `drizzle/`
4. `pnpm run db:migrate`

### Disable signups

Set in `.env` and as a Wrangler secret:

```env
BETTER_AUTH_DISABLE_SIGNUP=true
```

### Add OAuth (Google, GitHub, etc.)

In `src/lib/auth/server.ts`, add `socialProviders`:

```ts
betterAuth({
  // ...
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
    },
  },
})
```

Set the secrets via `wrangler secret put`. Add the OAuth callback `https://your-app/api/auth/callback/github` to the GitHub OAuth app config.

### Email sending (forgot password)

Forgot-password currently calls `/api/auth/forget-password` but no email is dispatched. To enable:

1. Pick a provider (Resend, Postmark, SES, Mailgun)
2. In `src/lib/auth/server.ts`, add to `emailAndPassword`:

```ts
emailAndPassword: {
  enabled: true,
  // ...
  sendResetPassword: async ({ user, url }) => {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'no-reply@example.com',
        to: user.email,
        subject: 'Reset your password',
        html: `<a href="${url}">Reset password</a>`,
      }),
    })
  },
},
```

3. `wrangler secret put RESEND_API_KEY`

## Troubleshooting

### `Missing database connection string`

The Worker found no Hyperdrive binding and no `DATABASE_URL`. Either:

- Local: `.env` is missing `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE`
- Prod: the `hyperdrive` block was removed from `wrangler.jsonc` and no `DATABASE_URL` secret is set

### `relation "user" does not exist`

You skipped `pnpm run db:migrate`.

### `Invalid origin` when signing in

`BETTER_AUTH_URL` doesn't match the page origin. Either fix `wrangler.jsonc` or add the origin to `BETTER_AUTH_TRUSTED_ORIGINS`.

### Cookies not set in dev

You're hitting Vite (port 3450) but cookies are scoped to the Worker. The `@cloudflare/vite-plugin` proxies API calls automatically — make sure you fetch `/api/...` (relative), not `http://localhost:8787`.

### `bcryptjs` errors at runtime

Check `wrangler.jsonc` has `"compatibility_flags": ["nodejs_compat"]`.

### Type errors after editing wrangler.jsonc

```bash
pnpm run cf-typegen
```
