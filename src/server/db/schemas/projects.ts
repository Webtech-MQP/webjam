import { relations, sql } from "drizzle-orm";
import { createTable } from "../schema-util";

import { createId } from "@paralleldrive/cuid2";
import { primaryKey } from "drizzle-orm/sqlite-core";
import { admins, candidates } from "./users";

export const projects = createTable("project", (d) => ({
  id: d
    .text()
    .$defaultFn(() => createId())
    .primaryKey(),
  title: d.text({ length: 256 }),
  description: d.text({ length: 256 }),
  instructions: d.text({ length: 256 }),
  requirements: d.text({ length: 256 }),
  img: d.text({ length: 256 }),
  status: d.text({ enum: ["in-progress", "completed", "upcoming"]}).default("in-progress"),
  deadline: d.integer({ mode: "timestamp" }),
  startDateTime: d.integer({ mode: "timestamp" }),
  endDateTime: d.integer({ mode: "timestamp" }),
  createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  createdBy: d
    .text({ length: 255 })
    .notNull()
    .references(() => admins.userId),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  submission: one(projectSubmissions, {
    fields: [projects.id],
    references: [projectSubmissions.projectId],
  }),
  candidatesToProjects: many(candidatesToProjects),
  tags: many(projectsTags),
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
  status: d.text({ enum: ["submitted", "under-review", "approved"]}).default("submitted"),
  reviewedOn: d.integer({ mode: "timestamp" }),
  reviewedBy: d
    .text({ length: 255 })
    .notNull()
    .references(() => admins.userId),
  repoURL: d.text({ length: 255 }),
  notes: d.text({ length: 255 }),
}));

export const tags = createTable("tag", (d) => ({
  id: d
    .text()
    .$defaultFn(() => createId())
    .primaryKey(),
  name: d.text({ length: 256 }).unique(),
}));

export const candidatesToProjects = createTable(
  "candidates_to_projects",
  (d) => ({
    candidateId: d
      .text("candidate_id")
      .notNull()
      .references(() => candidates.userId, { onDelete: "cascade" }),
    projectId: d
      .text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
  }),
  (t) => [primaryKey({ columns: [t.candidateId, t.projectId] })],
);

export const candidatesToProjectsRelations = relations(
  candidatesToProjects,
  ({ one }) => ({
    candidate: one(candidates, {
      fields: [candidatesToProjects.candidateId],
      references: [candidates.userId],
    }),
    project: one(projects, {
      fields: [candidatesToProjects.projectId],
      references: [projects.id],
    }),
  }),
);

export const projectSubmissionsRelations = relations(
  projectSubmissions,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectSubmissions.projectId],
      references: [projects.id],
    }),
  }),
);

//m-m project and tags
export const projectsTags = createTable("projects_tags", (d) => ({
  projectId: d
    .text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  tagId: d
    .text("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
}));

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
