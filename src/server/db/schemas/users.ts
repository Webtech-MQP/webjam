import { relations, sql } from "drizzle-orm";
import { createTable } from "../schema-util";

import type { AdapterAccount } from "next-auth/adapters";
import { createId } from "@paralleldrive/cuid2";
import { index, primaryKey } from "drizzle-orm/sqlite-core";

export const users = createTable("user", (d) => ({
  id: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: d.text({ length: 255 }),
  email: d.text({ length: 255 }).notNull(),
  emailVerified: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  image: d.text({ length: 255 }),
  // role: d.enum(["candidate", "recruiter", "admin"]).default("candidate"),
  createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  candidate: one(candidates),
  recruiter: one(recruiters),
  admin: one(admins),
}));

export const admins = createTable("admin", (d) => ({
  userId: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  // role: d.enum(["Reg", "Mod", "Super", "idk"]).default("Reg"),
}));

export const candidates = createTable("candidate", (d) => ({
  userId: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: d.text({ length: 255 }),
  location: d.text({ length: 255 }),
  language: d.text({ length: 255 }),
  experience: d.text({ length: 255 }),
  githubUsername: d.text({ length: 255 }),
  portfolioURL: d.text({ length: 255 }),
  linkedinURL: d.text({ length: 255 }),
  resumeURL: d.text({ length: 255 }),
}));

export const recruiters = createTable("recruiter", (d) => ({
  userId: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: d.text({ length: 255 }),
}));

//for faster query through user fields
export const adminsUserRelations = relations(admins, ({ one }) => ({
  user: one(users, { fields: [admins.userId], references: [users.id] }),
}));

export const recruitersUserRelations = relations(recruiters, ({ one }) => ({
  user: one(users, { fields: [recruiters.userId], references: [users.id] }),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.text({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.text({ length: 255 }).notNull(),
    providerAccountId: d.text({ length: 255 }).notNull(),
    refresh_token: d.text(),
    refresh_token_expires_in: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.text({ length: 255 }),
    scope: d.text({ length: 255 }),
    id_token: d.text(),
    session_state: d.text({ length: 255 }),
  }),
  (t) => [
    primaryKey({
      columns: [t.provider, t.providerAccountId],
    }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.text({ length: 255 }).notNull().primaryKey(),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.integer({ mode: "timestamp" }).notNull(),
  }),
  (t) => [index("session_userId_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.text({ length: 255 }).notNull(),
    token: d.text({ length: 255 }).notNull(),
    expires: d.integer({ mode: "timestamp" }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
