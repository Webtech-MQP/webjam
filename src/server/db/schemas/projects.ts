import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/sqlite-core';
import { createTable } from '../schema-util';
import { users } from './auth';
import { adminProfiles, candidateProfiles } from './profiles';
import { projectRegistrations, projectsToRegistrationQuestions } from './project-registration';
import { projectAward } from './awards';

export const projects = createTable('project', (d) => ({
    id: d
        .text()
        .$defaultFn(() => createId())
        .primaryKey(),
    title: d.text({ length: 256 }).notNull(),
    subtitle: d.text({ length: 256 }).notNull(),
    description: d.text({ length: 256 }).notNull().default(''),
    instructions: d.text({ length: 256 }).notNull().default(''),
    requirements: d.text({ length: 256 }).notNull(),
    imageUrl: d.text({ length: 256 }),
    status: d
        .text({ enum: ['created', 'judging', 'completed'] })
        .notNull()
        .default('created'),
    deadline: d.integer({ mode: 'timestamp' }),
    numberOfMembers: d.integer().notNull().default(1),
    // NOTE: The start and end date are soon to disappear! Do not use!
    startDateTime: d.integer({ mode: 'timestamp' }).notNull(),
    endDateTime: d.integer({ mode: 'timestamp' }).notNull(),
    registerBy: d.integer({ mode: 'timestamp' }),
    createdAt: d
        .integer({ mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`),
    updatedAt: d
        .integer({ mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`),
    createdBy: d.text({ length: 255 }).references(() => adminProfiles.userId, { onDelete: 'set null' }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    projectsToTags: many(projectsTags),
    creator: one(adminProfiles, {
        fields: [projects.createdBy],
        references: [adminProfiles.userId],
    }),
    questions: many(projectsToRegistrationQuestions),
    registrations: many(projectRegistrations),
    projectInstances: many(projectInstances),
    events: many(projectEvent),
    awards: many(projectAward),
}));

export const projectInstances = createTable('project_instance', (d) => ({
    id: d
        .text()
        .$defaultFn(() => createId())
        .primaryKey(),
    teamName: d.text({ length: 256 }),
    repoUrl: d.text({ length: 256 }),
    projectId: d.text().notNull(),
}));

export const projectInstanceRatings = createTable(
    'project_instance_rating',
    (d) => ({
        id: d.text().$defaultFn(() => createId()),
        projectInstanceId: d
            .text()
            .notNull()
            .references(() => projectInstances.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        ratedBy: d
            .text()
            .notNull()
            .references(() => candidateProfiles.userId, { onDelete: 'cascade', onUpdate: 'cascade' }),
        rating: d.integer().notNull(), // e.g., 1 to 10
        ratedOn: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),
    }),
    (t) => [primaryKey({ columns: [t.projectInstanceId, t.ratedBy] })]
);

export const projectInstanceRatingRelations = relations(projectInstanceRatings, ({ one }) => ({
    projectInstance: one(projectInstances, {
        fields: [projectInstanceRatings.projectInstanceId],
        references: [projectInstances.id],
    }),
    rater: one(candidateProfiles, {
        fields: [projectInstanceRatings.ratedBy],
        references: [candidateProfiles.userId],
    }),
}));

export const projectInstanceRelations = relations(projectInstances, ({ one, many }) => ({
    project: one(projects, {
        fields: [projectInstances.projectId],
        references: [projects.id],
    }),
    teamMembers: many(candidateProfilesToProjectInstances),
    submission: many(projectSubmissions),
    feedbackRatings: many(projectInstanceRatings),
}));

export const projectEvent = createTable('project_timeline_event', (d) => ({
    id: d.text().$defaultFn(() => createId()),
    startTime: d.integer({ mode: 'timestamp' }).notNull(),
    endTime: d.integer({ mode: 'timestamp' }).notNull(),
    title: d.text({ length: 256 }).notNull(),
    description: d.text({ length: 256 }).notNull(),
    projectId: d
        .text()
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
}));

export const projectEventRelations = relations(projectEvent, ({ one }) => ({
    project: one(projects, {
        fields: [projectEvent.projectId],
        references: [projects.id],
    }),
}));

export const projectSubmissions = createTable('project_submission', (d) => ({
    id: d
        .text()
        .$defaultFn(() => createId())
        .primaryKey(),
    projectInstanceId: d
        .text()
        .notNull()
        .references(() => projectInstances.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    submittedOn: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),
    submittedBy: d
        .text()
        .notNull()
        .references(() => users.id),
    status: d.text({ enum: ['submitted', 'under-review', 'approved', 'denied'] }).default('submitted'),
    reviewedOn: d.integer({ mode: 'timestamp' }),
    reviewedBy: d.text({ length: 255 }).references(() => adminProfiles.userId),
    notes: d.text({ length: 255 }),
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

export const candidateProfilesToProjectInstances = createTable(
    'candidate_profiles_to_project_instances',
    (d) => ({
        candidateId: d
            .text('candidate_id')
            .notNull()
            .references(() => candidateProfiles.userId, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        projectInstanceId: d
            .text('project_id')
            .notNull()
            .references(() => projectInstances.id, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        visible: d.integer('visible', { mode: 'boolean' }).notNull().default(true),
    }),
    (t) => [primaryKey({ columns: [t.candidateId, t.projectInstanceId] })]
);

export const candidateProfilesToProjectsRelations = relations(candidateProfilesToProjectInstances, ({ one }) => ({
    candidateProfile: one(candidateProfiles, {
        fields: [candidateProfilesToProjectInstances.candidateId],
        references: [candidateProfiles.userId],
    }),
    projectInstance: one(projectInstances, {
        fields: [candidateProfilesToProjectInstances.projectInstanceId],
        references: [projectInstances.id],
    }),
}));

export const projectSubmissionRating = createTable(
    'project_submission_rating',
    (d) => ({
        id: d.text().$defaultFn(() => createId()),
        submissionId: d
            .text()
            .notNull()
            .references(() => projectSubmissions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        ratedBy: d
            .text()
            .notNull()
            .references(() => adminProfiles.userId, { onDelete: 'set null' }),
        rating: d.integer().notNull(), // e.g., 1 to 10
        ratedOn: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),
    }),
    (t) => [primaryKey({ columns: [t.submissionId, t.ratedBy] })]
);

export const projectSubmissionRatingRelations = relations(projectSubmissionRating, ({ one }) => ({
    submission: one(projectSubmissions, {
        fields: [projectSubmissionRating.submissionId],
        references: [projectSubmissions.id],
    }),
    rater: one(adminProfiles, {
        fields: [projectSubmissionRating.ratedBy],
        references: [adminProfiles.userId],
    }),
}));

export const projectSubmissionsRelations = relations(projectSubmissions, ({ one, many }) => ({
    projectInstance: one(projectInstances, {
        fields: [projectSubmissions.projectInstanceId],
        references: [projectInstances.id],
    }),
    reviewer: one(adminProfiles, {
        fields: [projectSubmissions.reviewedBy],
        references: [adminProfiles.userId],
    }),
    submitter: one(users, {
        fields: [projectSubmissions.submittedBy],
        references: [users.id],
    }),
    ratings: many(projectSubmissionRating),
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
