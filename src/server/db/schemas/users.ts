import { relations, sql } from 'drizzle-orm';
import { createTable } from '../schema-util';

import { createId } from '@paralleldrive/cuid2';
import { primaryKey, unique } from 'drizzle-orm/sqlite-core';
import { accounts } from './auth';
import { candidateProfilesToProjects } from './projects';

export const users = createTable(
    'user',
    (d) => ({
        id: d
            .text({ length: 255 })
            .notNull()
            .primaryKey()
            .$defaultFn(() => createId()),
        name: d.text({ length: 255 }),
        image: d.text({ length: 255 }),
        email: d.text({ length: 255 }).notNull(),
        emailVerified: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),
        phoneNumber: d.text({ length: 255 }),
        role: d.text({ enum: ['candidate', 'recruiter', 'admin'] }).default('candidate'),
        createdAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),
        updatedAt: d.integer({ mode: 'timestamp' }).default(sql`(unixepoch())`),
        githubUsername: d.text({ length: 255 }),
    }),
    (t) => [unique('user_id_role_unique').on(t.id, t.role)]
);

export const usersRelations = relations(users, ({ one, many }) => ({
    accounts: many(accounts),
    candidateProfile: one(candidateProfiles),
    recruiterProfile: one(recruiterProfiles),
    adminProfile: one(adminProfiles),
}));

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
    githubUsername: d.text({ length: 255 }),
    portfolioURL: d.text({ length: 255 }),
    linkedinURL: d.text({ length: 255 }),
    // This is different from user.image (user.image is github image)
    imageURL: d.text({ length: 255 }),
}));

export const candidateProfilesRelations = relations(candidateProfiles, ({ one, many }) => ({
    user: one(users, {
        fields: [candidateProfiles.userId],
        references: [users.id],
    }),
    projects: many(candidateProfilesToProjects),
}));

export const recruiterProfiles = createTable('recruiter_profile', (d) => ({
    userId: d
        .text({ length: 255 })
        .notNull()
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    // Required profile info
    displayName: d.text({ length: 255 }).notNull(),

    // Previously in recruiters table
    companyName: d.text({ length: 255 }),
    location: d.text({ length: 255 }),

    // Extended profile info
    bio: d.text({ length: 255 }),
    companyWebsite: d.text({ length: 255 }),
    linkedinURL: d.text({ length: 255 }),
    imageURL: d.text({ length: 255 }),
    publicEmail: d.text({ length: 255 }),
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
    imageURL: d.text({ length: 255 }),
    contactEmail: d.text({ length: 255 }),
}));

export const adminProfilesRelations = relations(adminProfiles, ({ one }) => ({
    user: one(users, {
        fields: [adminProfiles.userId],
        references: [users.id],
    }),
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
