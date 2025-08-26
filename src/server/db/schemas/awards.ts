import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import { createTable } from '../schema-util';
import { candidateProfiles } from './profiles';
import { projects, projectSubmissions } from './projects';

export const awards = createTable('award', (d) => ({
    id: d
        .text()
        .$defaultFn(() => createId())
        .primaryKey(),
    title: d.text({ length: 256 }).notNull(),
    description: d.text({ length: 1000 }),
    imageURL: d.text({ length: 255 }).notNull(),
    createdAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),
}));

export const awardsRelations = relations(awards, ({ many }) => ({
    candidateAward: many(candidateAward),
    projects: many(projectAward),
}));

export const candidateAward = createTable('candidate_award', (d) => ({
    id: d
        .text()
        .$defaultFn(() => createId())
        .primaryKey(),
    userId: d
        .text()
        .notNull()
        .references(() => candidateProfiles.userId, { onDelete: 'cascade' }),
    awardId: d
        .text()
        .notNull()
        .references(() => awards.id, { onDelete: 'cascade' }),
    projectSubmissionId: d.text({ length: 255 }).references(() => projectSubmissions.id, { onDelete: 'set null' }),
    earnedAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),
    displayOrder: d.integer().default(0),
    isVisible: d.integer({ mode: 'boolean' }).default(true),
}));

export const candidateAwardRelations = relations(candidateAward, ({ one }) => ({
    candidate: one(candidateProfiles, {
        fields: [candidateAward.userId],
        references: [candidateProfiles.userId],
    }),
    award: one(awards, {
        fields: [candidateAward.awardId],
        references: [awards.id],
    }),
    projectSubmission: one(projectSubmissions, {
        fields: [candidateAward.projectSubmissionId],
        references: [projectSubmissions.id],
    }),
}));

export const projectAward = createTable('projects_awards', (d) => ({
    projectId: d
        .text('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    awardId: d
        .text('award_id')
        .notNull()
        .references(() => awards.id, { onDelete: 'cascade' }),
}));

export const projectAwardRelations = relations(projectAward, ({ one }) => ({
    project: one(projects, {
        fields: [projectAward.projectId],
        references: [projects.id],
    }),
    award: one(awards, {
        fields: [projectAward.awardId],
        references: [awards.id],
    }),
}));
