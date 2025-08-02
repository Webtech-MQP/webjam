import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import { createTable } from '../schema-util';
import { adminProfiles, candidateProfiles } from './profiles';
import { projects } from './projects';
import { primaryKey } from 'drizzle-orm/sqlite-core';

export const projectRegistrationQuestions = createTable('project_registration_question', (d) => ({
    id: d.text().$defaultFn(() => createId()).primaryKey(),
    question: d.text({ length: 512 }).notNull(),
    type: d.text({ enum: ['text', 'select', 'multi-select'] }).default('text'),
    options: d.text(), 
    required: d.integer({ mode: 'boolean' }).default(true),
    createdBy: d.text({ length: 255 }).references(() => adminProfiles.userId, { onDelete: 'set null' }),
}))

export const projectRegistrationQuestionsRelations = relations(projectRegistrationQuestions, ({ many }) => ({
    projects: many(projectsToRegistrationQuestions),
    answers: many(projectRegistrationAnswer),
}));

export const projectRegistrations = createTable('project_registration', (d) => ({
    id: d.text().$defaultFn(() => createId()).primaryKey(),
    projectId: d.text().notNull().references(() => projects.id, { onDelete: 'cascade' }),
    candidateId: d.text().notNull().references(() => candidateProfiles.userId, { onDelete: 'cascade' }),
    submittedAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),
    status: d.text({ enum: ['pending', 'accepted', 'rejected'] }).default('pending'),
}));

export const projectRegistrationRelations = relations(projectRegistrations, ({ one, many }) => ({
    project: one(projects, {
        fields: [projectRegistrations.projectId],
        references: [projects.id],
    }),
    candidate: one(candidateProfiles, {
        fields: [projectRegistrations.candidateId],
        references: [candidateProfiles.userId],
    }),
    answers: many(projectRegistrationAnswer),
}));

export const projectRegistrationAnswer = createTable('project_registration_answer', (d) => ({
    id: d.text().$defaultFn(() => createId()).primaryKey(),
    registrationId: d.text().notNull().references(() => projectRegistrations.id, { onDelete: 'cascade' }),
    questionId: d.text().notNull().references(() => projectRegistrationQuestions.id, { onDelete: 'cascade' }),
    answer: d.text({ length: 2048 }).notNull(),
}));

export const projectRegistrationAnswerRelations = relations(projectRegistrationAnswer, ({ one }) => ({
    registration: one(projectRegistrations, {
        fields: [projectRegistrationAnswer.registrationId],
        references: [projectRegistrations.id],
    }),
    question: one(projectRegistrationQuestions, {
        fields: [projectRegistrationAnswer.questionId],
        references: [projectRegistrationQuestions.id],
    }),
}));

export const projectsToRegistrationQuestions = createTable('projects_to_registration_questions', (d) => ({
    projectId: d
        .text()
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    questionId: d
        .text()
        .notNull()
        .references(() => projectRegistrationQuestions.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    order: d.integer().notNull().default(0), 
    }),
    (t) => [primaryKey({ columns: [t.projectId, t.questionId] })]
);

export const projectsToRegistrationQuestionsRelations = relations(projectsToRegistrationQuestions, ({ one }) => ({
    project: one(projects, {
        fields: [projectsToRegistrationQuestions.projectId],
        references: [projects.id],
    }),
    question: one(projectRegistrationQuestions, {
        fields: [projectsToRegistrationQuestions.questionId],
        references: [projectRegistrationQuestions.id],
    }),
}));