import { relations } from 'drizzle-orm';
import { primaryKey } from 'drizzle-orm/sqlite-core';
import { createTable } from '../schema-util';
import { users } from './auth';
import { candidateProfilesToProjects } from './projects';

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
    imageURL: d.text({ length: 255 }),
}));

export const candidateProfilesRelations = relations(candidateProfiles, ({ one, many }) => ({
    user: one(users, {
        fields: [candidateProfiles.userId],
        references: [users.id],
    }),
    candidateProfilesToProjects: many(candidateProfilesToProjects),
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
    imageURL: d.text({ length: 255 }),
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
