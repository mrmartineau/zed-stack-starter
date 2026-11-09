import { app } from './hono'

// Default export is what the Workers runtime needs.
// https://hono.dev/docs/getting-started/cloudflare-workers#using-hono-with-other-event-handlers
export default {
  fetch: app.fetch,
}
