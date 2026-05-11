import { eq } from "drizzle-orm";
import type { Context } from "hono";
import type { Db } from "../../db/client";
import { profiles } from "../../db/schema";
import { createAuth } from "@/lib/auth/server";
import { errorResponse } from "@/lib/fetching/errorResponse";
import type { UserProfile } from "@/types/db";
import type { WorkerEnv } from "./env";

export type RequestContext = {
  db: Db;
  profile: UserProfile | null;
  user: { id: string; email: string } | null;
};

type Profile = typeof profiles.$inferSelect;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const profileToRow = (profile: Profile): UserProfile => ({
  api_key: profile.apiKey,
  avatar_url: profile.avatarUrl,
  id: profile.id,
  updated_at: profile.updatedAt?.toISOString() ?? null,
  username: profile.username,
});

const getBearerToken = (request: Context["req"]) => {
  const authHeader = request.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim() || null;
};

export const getProfileById = async (db: Db, userId: string) => {
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  return profile ? profileToRow(profile) : null;
};

export const getProfileByApiKey = async (db: Db, apiKey: string) => {
  if (!uuidPattern.test(apiKey)) return null;
  const [profile] = await db.select().from(profiles).where(eq(profiles.apiKey, apiKey)).limit(1);
  return profile ? profileToRow(profile) : null;
};

export const createRequestContext = async (
  context: Context<{ Bindings: WorkerEnv }>,
): Promise<RequestContext> => {
  const db = context.var.db;
  const auth = createAuth(context.env, db);
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  if (session?.user) {
    return {
      db,
      profile: await getProfileById(db, session.user.id),
      user: { email: session.user.email, id: session.user.id },
    };
  }

  const bearerToken = getBearerToken(context.req);

  if (bearerToken) {
    const profile = await getProfileByApiKey(db, bearerToken);
    return {
      db,
      profile,
      user: profile ? { email: profile.username ?? "", id: profile.id } : null,
    };
  }

  return { db, profile: null, user: null };
};

export const requireRequestContext = async (context: Context<{ Bindings: WorkerEnv }>) => {
  const requestContext = await createRequestContext(context);

  if (!requestContext.user || !requestContext.profile) {
    return errorResponse({
      error: "Authentication required",
      reason: "Missing or invalid session/API key",
      status: 401,
    });
  }

  return requestContext;
};
