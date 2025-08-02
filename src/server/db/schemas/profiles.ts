import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/sqlite-core';
import { createTable } from '../schema-util';
import { users } from './auth';
import { candidateProfilesToProjectInstances } from './projects';

export const candidateProfiles = createTable('candidate_profile', (d) => ({
    userId: d
        .text({ length: 255 })
        .notNull()
        .primaryKey()
        .references(() => users.id, {
            onDelete: 'cascade',
            onUpdate: 'cascade',
        }),
    // Required profile info
    displayName: d.text({ length: 255 }).notNull(),

    // Previously in candidates table
    location: d.text({ length: 255 }),
    language: d.text({ length: 255 }),
    resumeURL: d.text({ length: 255 }),

    // Extended profile info
    bio: d.text({ length: 255 }),
    experience: d.text({ length: 255 }),
    portfolioURL: d.text({ length: 255 }),
    linkedinURL: d.text({ length: 255 }),
    // This is different from user.image (user.image is github image)
    imageUrl: d.text({ length: 255 }),
}));

export const candidateProfilesRelations = relations(candidateProfiles, ({ one, many }) => ({
    user: one(users, {
        fields: [candidateProfiles.userId],
        references: [users.id],
    }),
    candidateProfilesToProjectInstances: many(candidateProfilesToProjectInstances),
    reports: many(candidateReport),
}));

export const recruiterProfiles = createTable('recruiter_profile', (d) => ({
    userId: d
        .text({ length: 255 })
        .notNull()
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    // Required profile info

    // NULL => use user.name
    displayName: d.text({ length: 255 }),
    displayEmail: d.text({ length: 255 }).notNull().default(''),

    // Previously in recruiters table
    companyName: d.text({ length: 255 }).notNull().default(''),
    location: d.text({ length: 255 }).notNull().default(''),

    // Extended profile info
    bio: d.text({ length: 255 }).notNull().default(''),
    companyWebsite: d.text({ length: 255 }).notNull().default(''),
    linkedinURL: d.text({ length: 255 }).notNull().default(''),
    imageUrl: d.text({ length: 255 }),
}));

export const recruiterProfilesRelations = relations(recruiterProfiles, ({ one }) => ({
    user: one(users, {
        fields: [recruiterProfiles.userId],
        references: [users.id],
    }),
}));

export const adminProfiles = createTable('admin_profile', (d) => ({
    userId: d
        .text({ length: 255 })
        .notNull()
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    // Required profile info
    displayName: d.text({ length: 255 }).notNull(),

    // Previously in admins table
    adminRole: d.text({ enum: ['Reg', 'Mod', 'Super', 'idk'] }).default('Reg'),

    // Extended profile info
    bio: d.text({ length: 255 }),
    imageUrl: d.text({ length: 255 }),
    contactEmail: d.text({ length: 255 }),
}));

export const adminProfilesRelations = relations(adminProfiles, ({ one, many }) => ({
    user: one(users, {
        fields: [adminProfiles.userId],
        references: [users.id],
    }),
    reportsActioned: many(candidateReport),
}));

export const recruitersToCandidates = createTable(
    'recruiters_candidates',
    (d) => ({
        recruiterId: d
            .text('recruiter_id')
            .notNull()
            .references(() => recruiterProfiles.userId, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        candidateId: d
            .text('candidate_id')
            .notNull()
            .references(() => candidateProfiles.userId, {
                onDelete: 'cascade',
                onUpdate: 'cascade',
            }),
        comments: d.text('comments').notNull().default(''),
    }),
    (t) => [primaryKey({ columns: [t.candidateId, t.recruiterId] })]
);

export const recruitersToCandidatesRelations = relations(recruitersToCandidates, ({ one }) => ({
    recruiterProfile: one(recruiterProfiles, {
        fields: [recruitersToCandidates.recruiterId],
        references: [recruiterProfiles.userId],
    }),
    candidateProfile: one(candidateProfiles, {
        fields: [recruitersToCandidates.candidateId],
        references: [candidateProfiles.userId],
    }),
}));

export const candidateReport = createTable('candidate_report', (d) => ({
    id: d
        .text()
        .$defaultFn(() => createId())
        .primaryKey(),
    candidateId: d.text('candidate_id').references(() => candidateProfiles.userId, {
        onDelete: 'set null',
        onUpdate: 'cascade',
    }),
    reporterId: d.text('reporter_id').references(() => users.id, {
        onDelete: 'set null',
        onUpdate: 'cascade',
    }),
    reason: d.text('reason').notNull(),
    additionalDetails: d.text('additional_details').notNull().default(''),
    createdAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),

    action: d.text({ enum: ['banned', 'archived'] }),
    actionedAt: d.integer({ mode: 'timestamp' }),
    actionedBy: d.text().references(() => adminProfiles.userId),
    bannedUserDisplayName: d.text('banned_user_display_name').notNull().default('A user'),
}));

export const candidateReportRelations = relations(candidateReport, ({ one }) => ({
    candidateProfile: one(candidateProfiles, {
        fields: [candidateReport.candidateId],
        references: [candidateProfiles.userId],
    }),
    reporter: one(users, {
        fields: [candidateReport.reporterId],
        references: [users.id],
    }),
    actioner: one(adminProfiles, {
        fields: [candidateReport.actionedBy],
        references: [adminProfiles.userId],
    }),
}));
