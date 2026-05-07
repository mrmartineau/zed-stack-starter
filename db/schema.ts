import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const authUsers = pgTable(
  "user",
  {
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    id: uuid("id").primaryKey().defaultRandom(),
    image: text("image"),
    name: text("name").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("user_email_key").on(table.email)],
);

export const authSessions = pgTable(
  "session",
  {
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    ipAddress: text("ip_address"),
    token: text("token").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("session_token_key").on(table.token),
    index("session_user_id_idx").on(table.userId),
  ],
);

export const authAccounts = pgTable(
  "account",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    accountId: text("account_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()::text`),
    idToken: text("id_token"),
    password: text("password"),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
);

export const authVerifications = pgTable("verification", {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()::text`),
  identifier: text("identifier").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  value: text("value").notNull(),
});

export const authJwks = pgTable("jwks", {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()::text`),
  privateKey: text("private_key").notNull(),
  publicKey: text("public_key").notNull(),
});

export const profiles = pgTable(
  "profiles",
  {
    apiKey: uuid("api_key").notNull().defaultRandom(),
    avatarUrl: text("avatar_url"),
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    username: text("username"),
  },
  (table) => [
    check("username_length", sql`char_length(${table.username}) >= 3`),
    uniqueIndex("profiles_api_key_key").on(table.apiKey),
    uniqueIndex("profiles_username_key").on(table.username),
  ],
);
