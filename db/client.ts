import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = ReturnType<typeof createDb>;

export type DbEnv = {
  DATABASE_URL?: string;
};

export const getDatabaseUrl = (env: DbEnv) => {
  if (!env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL");
  }
  return env.DATABASE_URL;
};

export const createDb = (env: DbEnv) => {
  const sql = neon(getDatabaseUrl(env));
  return drizzle(sql, { schema });
};
