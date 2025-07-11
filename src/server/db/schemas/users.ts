import { relations, sql } from "drizzle-orm";
import { createTable } from "../schema-util";

import { createId } from "@paralleldrive/cuid2";
import { candidateProfilesToProjects, candidatesToProjects } from "./projects";
import { accounts } from "./auth";
import { primaryKey, unique } from "drizzle-orm/sqlite-core";

export const users = createTable(
  "user",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    firstName: d.text({ length: 255 }).notNull(),
    middleName: d.text({ length: 255 }),
    lastName: d.text({ length: 255 }).notNull(),
    email: d.text({ length: 255 }).notNull(),
    emailVerified: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
    phoneNumber: d.text({ length: 255 }),
    role: d
      .text({ enum: ["candidate", "recruiter", "admin"] })
      .default("candidate"),
    createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
    updatedAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  }),
  (t) => [unique("user_id_role_unique").on(t.id, t.role)],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  candidate: one(candidates),
  recruiter: one(recruiters),
  admin: one(admins),
}));

export const admins = createTable(
  "admin",
  (d) => ({
    userId: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    role: d.text({ enum: ["Reg", "Mod", "Super", "idk"] }).default("Reg"),
  }),
  (t) => [unique("admin_userid_role_unique").on(t.userId, t.role)],
);

export const adminsRelations = relations(admins, ({ one }) => ({
  user: one(users, { fields: [admins.userId], references: [users.id] }),
}));

export const adminProfiles = createTable("admin_profile", (d) => ({
  adminId: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .references(() => admins.userId, { onDelete: "cascade" }),
  displayName: d.text({ length: 255 }).notNull(),
  bio: d.text({ length: 255 }),
  imageURL: d.text({ length: 255 }),
  contactEmail: d.text({ length: 255 }),
}));

export const candidates = createTable("candidate", (d) => ({
  userId: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  location: d.text({ length: 255 }),
  language: d.text({ length: 255 }),
  resumeURL: d.text({ length: 255 }),
}));

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  candidateProfile: one(candidateProfiles),
  candidatesToProjects: many(candidatesToProjects),
  user: one(users, {
    fields: [candidates.userId],
    references: [users.id],
  }),
  recruitersToCandidates: many(recruitersToCandidates),
}));

export const candidateProfiles = createTable("candidate_profile", (d) => ({
  candidateId: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .references(() => candidates.userId, { onDelete: "cascade" }),
  displayName: d.text({ length: 255 }).notNull(),
  bio: d.text({ length: 255 }),
  experience: d.text({ length: 255 }),
  githubUsername: d.text({ length: 255 }),
  portfolioURL: d.text({ length: 255 }),
  linkedinURL: d.text({ length: 255 }),
  imageURL: d.text({ length: 255 }),
}));

export const candidateProfilesRelations = relations(
  candidateProfiles,
  ({ many }) => ({
    projects: many(candidateProfilesToProjects),
  }),
);

export const recruiters = createTable("recruiter", (d) => ({
  userId: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: d.text({ length: 255 }),
  location: d.text({ length: 255 }),
}));

export const recruitersRelations = relations(recruiters, ({ one, many }) => ({
  user: one(users, { fields: [recruiters.userId], references: [users.id] }),
  recruiterProfile: one(recruiterProfiles),
  recruitersToCandidates: many(recruitersToCandidates),
}));

export const recruiterProfiles = createTable("recruiter_profile", (d) => ({
  recruiterId: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .references(() => recruiters.userId, { onDelete: "cascade" }),
  displayName: d.text({ length: 255 }).notNull(),
  companyName: d.text({ length: 255 }),
  bio: d.text({ length: 255 }),
  companyWebsite: d.text({ length: 255 }),
  linkedinURL: d.text({ length: 255 }),
  imageURL: d.text({ length: 255 }),
  publicEmail: d.text({ length: 255 }),
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
