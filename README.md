# React Supabase Starter

A modern, full-stack React starter template featuring Supabase authentication, TanStack Router, and Cloudflare Workers deployment.

## Tech Stack

| Category                 | Technology                                            |
| ------------------------ | ----------------------------------------------------- |
| **Framework**            | [React 19](https://react.dev/)                        |
| **Routing**              | [TanStack Router](https://tanstack.com/router)        |
| **Data Fetching**        | [TanStack Query](https://tanstack.com/query)          |
| **Auth & Database**      | [Supabase](https://supabase.com/)                     |
| **API Server**           | [Hono](https://hono.dev/)                             |
| **Deployment**           | [Cloudflare Workers](https://workers.cloudflare.com/) |
| **Styling**              | [Tailwind CSS v4](https://tailwindcss.com/)           |
| **UI Components**        | [shadcn/ui](https://ui.shadcn.com/)                   |
| **Validation**           | [Zod](https://zod.dev/)                               |
| **Linting & Formatting** | [Biome](https://biomejs.dev/)                         |
| **Testing**              | [Vitest](https://vitest.dev/)                         |

## Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- A [Supabase](https://supabase.com/) project
- A [Cloudflare](https://cloudflare.com/) account (for deployment)

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Variables

Create a `.env` file in the root of the project with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key
```

### 3. Start Development Server

```bash
bun run dev
```

The app will be available at [http://localhost:3450](http://localhost:3450).

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/              # shadcn/ui components
│   ├── AuthProvider.tsx # Authentication context
│   ├── login-form.tsx   # Login form component
│   └── ...
├── lib/                 # Shared libraries and utilities
│   ├── fetching/        # Data fetching utilities
│   │   └── user.ts      # User/session fetching
│   ├── supabase/        # Supabase client configuration
│   │   ├── client.ts    # Browser Supabase client
│   │   ├── customTypes.ts
│   │   └── supabase.ts  # Supabase types
│   └── utils.ts         # General utility functions
├── routes/              # TanStack Router file-based routes
│   ├── __root.tsx       # Root layout
│   ├── _authed/         # Protected routes (require auth)
│   │   └── app/         # Main application routes
│   ├── _public/         # Public, non-authed routes (login, signup, etc.)
│   └── index.tsx        # Home page
├── worker/              # Cloudflare Worker / Hono API
│   ├── hono.ts          # API routes
│   ├── index.ts         # Worker entry point
│   └── supabase/        # Server-side Supabase client
│       └── client.ts
├── constants.ts         # App constants and route definitions
├── main.tsx             # Application entry point
└── styles.css           # Global styles
```

## Authentication

This starter includes a complete authentication flow powered by Supabase:

- **Login** — Email/password authentication
- **Sign Up** — New user registration (can be disabled via `ALLOW_SIGNUP` constant)
- **Forgot Password** — Password reset flow
- **Update Password** — Password update for logged-in users
- **Protected Routes** — Routes under `/_authed` require authentication

The authentication state is managed through a React context (`AuthProvider`) and integrated with TanStack Query for caching.

## API Routes

API routes are handled by [Hono](https://hono.dev/) running on Cloudflare Workers. Routes are defined in `src/worker/hono.ts`:

```typescript
// All routes are prefixed with /api
app.get('/', (c) => c.text('API'))
app.get('debug', (c) => c.json({ message: 'Hello, world!' }))
```

The Hono server includes:

- Automatic 404 handling
- Error handling with logging
- Easy route definition

## Building for Production

```bash
bun run build
```

This runs Vite's production build followed by TypeScript compilation.

## Deployment

This project is configured for deployment to Cloudflare Workers.

### Deploy to Cloudflare

```bash
bun run deploy
```

This builds the project and deploys it using Wrangler. Make sure you're authenticated with Cloudflare:

```bash
bunx wrangler login
```

### Cloudflare Configuration

The Worker configuration is in `wrangler.jsonc`:

- **Smart Placement** — Automatically runs your Worker close to your backend services
- **AI Binding** — Cloudflare AI is available via the `AI` binding
- **SPA Routing** — Configured for single-page application routing

## Styling

This project uses [Tailwind CSS v4](https://tailwindcss.com/) for styling. Global styles are in `src/styles.css`.

### Adding shadcn/ui Components

Use the latest version of shadcn to add new components:

```bash
bunx shadcn@latest add button
bunx shadcn@latest add card
bunx shadcn@latest add input
```

Available components are configured in `components.json`.

## Testing

Tests are written with [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/).

```bash
# Run tests once
bun run test

# Run tests in watch mode
bunx vitest
```

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
# Format code
bun run format

# Lint code
bun run lint

# Check and fix all issues
bun run lint:check
```

## Available Scripts

| Script                       | Description                            |
| ---------------------------- | -------------------------------------- |
| `bun run dev`                | Start development server on port 3450  |
| `bun run build`              | Build for production                   |
| `bun run preview`            | Preview production build locally       |
| `bun run deploy`             | Build and deploy to Cloudflare Workers |
| `bun run test`               | Run tests                              |
| `bun run format`             | Format code with Biome                 |
| `bun run lint`               | Lint code with Biome                   |
| `bun run lint:check`         | Check and fix linting issues           |
| `bun run lint:fix`           | Fix linting issues                     |
| `bun run type-check`         | Run TypeScript type checking           |
| `bun run cf-typegen`         | Generate Cloudflare Worker types       |
| `bun run supabase:types:app` | Generate Supabase database types       |

## Generating Types

### Supabase Database Types

Generate TypeScript types from your Supabase database schema:

```bash
bun run supabase:types:app
```

This outputs types to `src/types/supabase.ts`.

### Cloudflare Worker Types

Generate types for Cloudflare bindings:

```bash
bun run cf-typegen
```

## License

MIT
