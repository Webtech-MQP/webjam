import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import { index, primaryKey, unique } from 'drizzle-orm/sqlite-core';
import type { AdapterAccount } from 'next-auth/adapters';
import { createTable } from '../schema-util';
import { adminProfiles, candidateProfiles, recruiterProfiles } from './users';

export const accounts = createTable(
    'account',
    (d) => ({
        userId: d
            .text({ length: 255 })
            .notNull()
            .references(() => users.id),
        type: d.text({ length: 255 }).$type<AdapterAccount['type']>().notNull(),
        provider: d.text({ length: 255 }).notNull(),
        providerAccountId: d.text({ length: 255 }).notNull(),
        refresh_token: d.text(),
        refresh_token_expires_in: d.text(),
        access_token: d.text(),
        expires_at: d.integer(),
        token_type: d.text({ length: 255 }),
        scope: d.text({ length: 255 }),
        id_token: d.text(),
        session_state: d.text({ length: 255 }),
    }),
    (t) => [
        primaryKey({
            columns: [t.provider, t.providerAccountId],
        }),
        index('account_user_id_idx').on(t.userId),
    ]
);

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
    'session',
    (d) => ({
        sessionToken: d.text({ length: 255 }).notNull().primaryKey(),
        userId: d
            .text({ length: 255 })
            .notNull()
            .references(() => users.id),
        expires: d.integer({ mode: 'timestamp' }).notNull(),
    }),
    (t) => [index('session_userId_idx').on(t.userId)]
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
    'verification_token',
    (d) => ({
        identifier: d.text({ length: 255 }).notNull(),
        token: d.text({ length: 255 }).notNull(),
        expires: d.integer({ mode: 'timestamp' }).notNull(),
    }),
    (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

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
