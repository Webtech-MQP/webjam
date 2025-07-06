// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql, relations } from "drizzle-orm";
import {
  index,
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
  // role: d.enum(["candidate", "recruiter", "admin"]).default("candidate"),
  createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const admins = createTable("admin", (d) => ({
  userId: d
    .text({ length: 255 })
    .notNull()
    .references(() => users.id),
  // role: d.enum(["Reg", "Mod", "Super", "idk"]).default("Reg"),
}))

export const candidates = createTable("candidate", (d) => ({
  userId: d
    .text({ length: 255 })
    .notNull()
    .references(() => users.id),
  bio: d.text({ length: 255 }),
  location: d.text({ length: 255 }),
  language: d.text({ length: 255 }),
  experience: d.text({ length: 255 }),
  githubUsername: d.text({ length: 255 }),
  portfolioURL: d.text({ length: 255 }),
  linkedinURL: d.text({ length: 255 }),
  resumeURL: d.text({ length: 255 }),
}))

export const candidatesRelations = relations(candidates, ({ many }) => ({
  candidatesToProjects: many(candidatesToProjects),
}));

export const recruiters = createTable("recruiter", (d) => ({
  userId: d
    .text({ length: 255 })
    .notNull()
    .references(() => users.id),
  companyName: d.text({ length: 255 }),
}))

//for faster query through user fields
export const adminsUserRelations = relations(admins, ({ one }) => ({
  user: one(users, { fields: [admins.userId], references: [users.id] }),
}));

export const candidatesUserRelations = relations(candidates, ({ one }) => ({
  user: one(users, { fields: [candidates.userId], references: [users.id] }),
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

export const projects = createTable("project", (d) => ({
  id: d
    .text()
    .$defaultFn(() => createId())
    .primaryKey(),
  title: d.text({ length: 256 }),
  deadline: d.integer({ mode: "timestamp" }),
  description: d.text({ length: 256 }),
  instructions: d.text({ length: 256 }),
  requirements: d.text({ length: 256 }),
  // status: d.enum(["in-progress", "completed", "upcoming"]).default("in-progress"),
  createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  startDateTime: d.integer({ mode: "timestamp" }),
  endDateTime: d.integer({ mode: "timestamp" }),
  img: d.text({ length: 256 }),
  createdBy: d
    .text({ length: 255 })
    .notNull()
    .references(() => admins.userId),
}));

export const projectSubmissions = createTable("projectSubmission", (d) => ({
  id: d
    .text()
    .$defaultFn(() => createId())
    .primaryKey(),
  projectId: d
    .text()
    .notNull()
    .references(() => projects.id),
  submittedOn: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  // status: d.enum(["submitted", "under-review", "approved"]).default("submitted");
  reviewedOn: d.integer({ mode: "timestamp" }),
  reviewedBy: d
    .text({ length: 255 })
    .notNull()
    .references(() => admins.userId),
  repoURL: d.text({ length: 255 }),
  notes: d.text({ length: 255 }),
}))

export const tags = createTable("tag", (d) => ({
  id: d
    .text()
    .$defaultFn(() => createId())
    .primaryKey(),
  name: d.text({ length: 256 }).unique(),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  usersToProjects: many(candidatesToProjects),
  tags: many(projectsTags),
}));

export const candidatesToProjects = createTable(
  "candidates_to_projects",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => candidates.userId, { onDelete: "cascade" }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.projectId] })],
);

export const candidatesToProjectsRelations = relations(
  candidatesToProjects,
  ({ one }) => ({
    candidate: one(candidates, {
      fields: [candidatesToProjects.userId],
      references: [candidates.userId],
    }),
    project: one(projects, {
      fields: [candidatesToProjects.projectId],
      references: [projects.id],
    }),
  }),
);
//0/1-1 projSubmission and project
export const projectRelations = relations(projects, ({ one }) => ({
  submission: one(projectSubmissions, {
    fields: [projects.id],
    references: [projectSubmissions.projectId],
  }),
}));

export const submissionRelations = relations(projectSubmissions, ({ one }) => ({
  project: one(projects, {
    fields: [projectSubmissions.projectId],
    references: [projects.id],
  }),
}));

//m-m project and tags
export const projectsTags = createTable("projects_tags", {
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

export const tagRelations = relations(tags, ({ many }) => ({
  projects: many(projectsTags),
}));

export const projectsTagsRelations = relations(projectsTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectsTags.projectId],
    references: [projects.id],
  }),
  tag: one(tags, {
    fields: [projectsTags.tagId],
    references: [tags.id],
  }),
}));

