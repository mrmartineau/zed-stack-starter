import { Hono } from "hono";
import { createAuth } from "@/lib/auth/server";
import type { WorkerEnv } from "./env";
import { dbMiddleware } from "./middleware/db";
import { getCurrentProfile, updateCurrentProfile } from "./profile";

export const app = new Hono<{ Bindings: WorkerEnv }>().basePath("/api");

// Routes that do not touch the database — declared before dbMiddleware
// so they skip the per-request Postgres connection.
app.get("/", (c) => c.text("Z Stack API", 200));

app.use("*", dbMiddleware);
app.on(["GET", "POST"], "/auth/*", async (c) => {
  return await createAuth(c.env, c.var.db).handler(c.req.raw);
});

app.get("/me", async (c) => await getCurrentProfile(c));
app.patch("/me", async (c) => await updateCurrentProfile(c));

app.notFound((c) => c.text("Not found", 404));

app.onError((err, c) => {
  console.error(err);
  return c.text(err.message, 500);
});
