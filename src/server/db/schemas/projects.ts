import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/sqlite-core';
import { createTable } from '../schema-util';
import { users } from './auth';
import { adminProfiles, candidateProfiles } from './profiles';

export const projects = createTable('project', (d) => ({
    id: d
        .text()
        .$defaultFn(() => createId())
        .primaryKey(),
    title: d.text({ length: 256 }),
    subtitle: d.text({ length: 256 }),
    description: d.text({ length: 256 }),
    instructions: d.text({ length: 256 }),
    requirements: d.text({ length: 256 }),
    imageURL: d.text({ length: 256 }),
    status: d.text({ enum: ['in-progress', 'completed', 'upcoming'] }).default('in-progress'),
    deadline: d.integer({ mode: 'timestamp' }),
    // NOTE: The start and end date are soon to disappear! Do not use!
    startDateTime: d.integer({ mode: 'timestamp' }),
    endDateTime: d.integer({ mode: 'timestamp' }),
    createdAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),
    updatedAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),
    createdBy: d.text({ length: 255 }).references(() => adminProfiles.userId, { onDelete: 'set null' }),

    projectTimeline: d.text({ length: 255 }).references(() => projectTimeline.id, { onDelete: 'set null' }),

    repoURL: d.text({ length: 255 }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    submission: one(projectSubmissions, {
        fields: [projects.id],
        references: [projectSubmissions.projectId],
    }),
    projectsToCandidateProfiles: many(candidateProfilesToProjects),
    projectsToTags: many(projectsTags),
    creator: one(adminProfiles, {
        fields: [projects.createdBy],
        references: [adminProfiles.userId],
    }),
    timeline: one(projectTimeline, {
        fields: [projects.projectTimeline],
        references: [projectTimeline.id],
    }),
}));

export const projectTimeline = createTable('project_timeline', (d) => ({
    id: d
        .text()
        .primaryKey()
        .$defaultFn(() => createId()),
    // TODO: Maybe don't need these in the future?
    title: d.text({ length: 256 }).notNull(),
    description: d.text({ length: 256 }).notNull(),
}));

export const projectTimelineRelations = relations(projectTimeline, ({ many }) => ({
    projects: many(projects),
    events: many(projectTimelineEvent),
}));

export const projectTimelineEvent = createTable('project_timeline_event', (d) => ({
    id: d.text().$defaultFn(() => createId()),
    startTime: d.integer({ mode: 'timestamp' }).notNull(),
    endTime: d.integer({ mode: 'timestamp' }).notNull(),
    title: d.text({ length: 256 }).notNull(),
    description: d.text({ length: 256 }).notNull(),
    projectTimelineId: d
        .text()
        .notNull()
        .references(() => projectTimeline.id, { onDelete: 'cascade' }),
}));

export const projectTimelineEventRelations = relations(projectTimelineEvent, ({ one }) => ({
    projectTimeline: one(projectTimeline, {
        fields: [projectTimelineEvent.projectTimelineId],
        references: [projectTimeline.id],
    }),
}));

export const projectSubmissions = createTable('projectSubmission', (d) => ({
    id: d
        .text()
        .$defaultFn(() => createId())
        .primaryKey(),
    projectId: d
        .text()
        .notNull()
        .references(() => projects.id),
    submittedOn: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),
    submittedBy: d
        .text()
        .notNull()
        .references(() => users.id),
    status: d.text({ enum: ['submitted', 'under-review', 'approved', 'denied'] }).default('submitted'),
    reviewedOn: d.integer({ mode: 'timestamp' }),
    reviewedBy: d.text({ length: 255 }),
    notes: d.text({ length: 1000 }),
    repositoryURL: d.text({ length: 512 }),
    deploymentURL: d.text({ length: 512 }),
}));

export const tags = createTable('tag', (d) => ({
    id: d
        .text()
        .$defaultFn(() => createId())
        .primaryKey(),
    name: d.text({ length: 256 }).unique().notNull(),
}));

export const candidateProfilesToProjects = createTable(
    'candidate_profiles_to_projects',
    (d) => ({
        candidateId: d
            .text('candidate_id')
            .notNull()
            .references(() => candidateProfiles.userId, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        projectId: d
            .text('project_id')
            .notNull()
            .references(() => projects.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        visible: d.integer('visible', { mode: 'boolean' }).notNull().default(true),
    }),
    (t) => [primaryKey({ columns: [t.candidateId, t.projectId] })]
);

export const candidateProfilesToProjectsRelations = relations(candidateProfilesToProjects, ({ one }) => ({
    candidateProfile: one(candidateProfiles, {
        fields: [candidateProfilesToProjects.candidateId],
        references: [candidateProfiles.userId],
    }),
    project: one(projects, {
        fields: [candidateProfilesToProjects.projectId],
        references: [projects.id],
    }),
}));

export const projectSubmissionsRelations = relations(projectSubmissions, ({ one }) => ({
    project: one(projects, {
        fields: [projectSubmissions.projectId],
        references: [projects.id],
    }),
    reviewer: one(adminProfiles, {
        fields: [projectSubmissions.reviewedBy],
        references: [adminProfiles.userId],
    }),
    submitter: one(users, {
        fields: [projectSubmissions.submittedBy],
        references: [users.id],
    }),
}));

export const projectsTags = createTable('projects_tags', (d) => ({
    projectId: d
        .text('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    tagId: d
        .text('tag_id')
        .notNull()
        .references(() => tags.id, { onDelete: 'cascade' }),
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
