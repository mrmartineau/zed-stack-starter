import { Hono } from "hono";
import { createAuth } from "@/lib/auth/server";
import type { WorkerEnv } from "./env";
import { getCurrentProfile, updateCurrentProfile } from "./profile";

export const app = new Hono<{ Bindings: WorkerEnv }>().basePath("/api");

app.get("/", (c) => c.text("Z Stack API", 200));

app.on(["GET", "POST"], "/auth/*", async (c) => {
  return await createAuth(c.env).handler(c.req.raw);
});

app.get("/me", async (c) => await getCurrentProfile(c));
app.patch("/me", async (c) => await updateCurrentProfile(c));

app.notFound((c) => c.text("Not found", 404));

app.onError((err, c) => {
  console.error(err);
  return c.text(err.message, 500);
});
