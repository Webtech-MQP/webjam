// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql, relations } from "drizzle-orm";
import {
  index,
  text,
  sqliteTableCreator,
  primaryKey,
  integer,
} from "drizzle-orm/sqlite-core";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { AdapterAccount } from "next-auth/adapters";
import { env } from "@/env";
import { createId } from "@paralleldrive/cuid2";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `prototype-3_${name}`);

const client = createClient({
  url: env.DATABASE_URL,
});
export const db = drizzle(client);

export const users = createTable("user", (d) => ({
  id: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.text({ length: 255 }),
  email: d.text({ length: 255 }).notNull(),
  emailVerified: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  image: d.text({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  usersToProjects: many(usersToProjects),
  ratings: many(ratings),
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

export const projects = createTable("project", (d) => ({
  id: d
    .text()
    .$defaultFn(() => createId())
    .primaryKey(),
  title: d.text({ length: 256 }),
  description: d.text(),
  deadline: d.integer({ mode: "timestamp" }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  usersToProjects: many(usersToProjects),
  tagsToProjects: many(tagsToProjects),
  ratings: many(ratings),
}));

export const ratings = createTable("rating", (d) => ({
  id: d
    .text()
    .$defaultFn(() => createId())
    .primaryKey(),
  comment: d.text(),
  rating: d.integer().notNull(),
  createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  userId: d.text("user_id"),
  projectId: d.text("project_id")
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  project: one(projects, {
    fields: [ratings.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
}));

export const tags = createTable("tag", (d) => ({
  id: d
    .text()
    .$defaultFn(() => createId())
    .primaryKey(),
  name: d.text({ length: 256 }).notNull()
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  projects: many(tagsToProjects),
}));

// Tags to projects many-to-many relationship
export const tagsToProjects = createTable(
  "projects_to_tags",
  {
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.tagId] })],
);

export const tagsToProjectsRelations = relations(
  tagsToProjects,
  ({ one }) => ({
    project: one(projects, {
      fields: [tagsToProjects.projectId],
      references: [projects.id],
    }),
    tag: one(tags, {
      fields: [tagsToProjects.tagId],
      references: [tags.id],
    }),
  }),
);

// User to projects many-to-many relationship
export const usersToProjects = createTable(
  "users_to_projects",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.projectId] })],
);

export const usersToProjectsRelations = relations(
  usersToProjects,
  ({ one }) => ({
    user: one(users, {
      fields: [usersToProjects.userId],
      references: [users.id],
    }),
    project: one(projects, {
      fields: [usersToProjects.projectId],
      references: [projects.id],
    }),
  }),
);
