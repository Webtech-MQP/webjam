import { relations, sql } from "drizzle-orm";
import { createTable } from "../schema-util";

import { createId } from "@paralleldrive/cuid2";
import { candidatesToProjects } from "./projects";
import { accounts } from "./auth";
import { primaryKey } from "drizzle-orm/sqlite-core";

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
  role: d.text({ enum: ["candidate", "recruiter", "admin"]}).default("candidate"),
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
  role: d.text({ enum: ["Reg", "Mod", "Super", "idk"]}).default("Reg"),
}));

export const adminsRelations = relations(admins, ({ one }) => ({
  user: one(users, { fields: [admins.userId], references: [users.id] }),
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

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  candidatesToProjects: many(candidatesToProjects),
  user: one(users, {
    fields: [candidates.userId],
    references: [users.id],
  }),
  recruitersToCandidates: many(recruitersToCandidates),
}));

export const recruiters = createTable("recruiter", (d) => ({
  userId: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: d.text({ length: 255 }),
}));

export const recruitersRelations = relations(recruiters, ({ one, many }) => ({
  user: one(users, { fields: [recruiters.userId], references: [users.id] }),
  recruitersToCandidates: many(recruitersToCandidates),
}));

export const recruitersToCandidates = createTable(
  "recruiters_candidates",
  (d) => ({
    recruiterId: d
      .text("recruiter_id")
      .notNull()
      .references(() => recruiters.userId, { onDelete: "cascade" }),
    candidateId: d
      .text("candidate_id")
      .notNull()
      .references(() => candidates.userId, { onDelete: "cascade" }),
    comments: d.text("comments").notNull().default(""),
  }),
  (t) => [primaryKey({ columns: [t.candidateId, t.recruiterId] })],
);

export const recruitersToCandidatesRelations = relations(
  recruitersToCandidates,
  ({ one }) => ({
    recruiter: one(recruiters, {
      fields: [recruitersToCandidates.recruiterId],
      references: [recruiters.userId],
    }),
    candidate: one(candidates, {
      fields: [recruitersToCandidates.candidateId],
      references: [candidates.userId],
    }),
  }),
);
