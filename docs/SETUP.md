# Setup Guide

Step-by-step setup for a fresh Z Stack Starter project. ~10 minutes.

## 1. Clone & install

```bash
git clone <this-repo> my-app
cd my-app
bun install
```

## 2. Provision Postgres (Neon)

1. Go to https://console.neon.tech/ and sign in
2. Create a new project (any region — pick one close to your Cloudflare deploy)
3. After creation, find **Connection string** → **Pooled connection**
4. Copy the string. Format:
   ```
   postgresql://USER:PASSWORD@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```

> Other Postgres options: Supabase (use the **Session pooler** string), Railway, Fly Postgres, RDS, local `docker run postgres`.

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
DATABASE_URL=postgresql://USER:PASS@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=<paste 64-char hex from step 3>
BETTER_AUTH_URL=http://localhost:3450
```

## 5. Apply schema to DB

```bash
bun run db:migrate
```

This runs the SQL files in `drizzle/` against `DATABASE_URL`. You should see 6 tables created:

- `user`, `session`, `account`, `verification`, `jwks` (better-auth)
- `profiles` (app-level user data)

Verify with Drizzle Studio:

```bash
bun run db:studio
```

## 6. Start dev server

```bash
bun run dev
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
bunx wrangler login
```

### Set production secrets

```bash
bunx wrangler secret put DATABASE_URL
bunx wrangler secret put BETTER_AUTH_SECRET
```

Paste your prod values when prompted. (Use a separate Neon branch/database for prod — don't reuse dev.)

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
bun run deploy
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
2. `bun run db:generate`
3. Inspect the new file in `drizzle/`
4. `bun run db:migrate`

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
});
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

### `Missing DATABASE_URL`

Worker can't read your secret. Either:

- Local: missing `.env` or wrong key name
- Prod: didn't run `wrangler secret put DATABASE_URL`

### `relation "user" does not exist`

You skipped `bun run db:migrate`.

### `Invalid origin` when signing in

`BETTER_AUTH_URL` doesn't match the page origin. Either fix `wrangler.jsonc` or add the origin to `BETTER_AUTH_TRUSTED_ORIGINS`.

### Cookies not set in dev

You're hitting Vite (port 3450) but cookies are scoped to the Worker. The `@cloudflare/vite-plugin` proxies API calls automatically — make sure you fetch `/api/...` (relative), not `http://localhost:8787`.

### `bcryptjs` errors at runtime

Check `wrangler.jsonc` has `"compatibility_flags": ["nodejs_compat"]`.

### Type errors after editing wrangler.jsonc

```bash
bun run cf-typegen
```
