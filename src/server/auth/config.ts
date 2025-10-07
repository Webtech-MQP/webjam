import { env } from '@/env';
import { db } from '@/server/db';
import { accounts, sessions, users, verificationTokens } from '@/server/db/schemas/auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import LinkedInProvider from 'next-auth/providers/linkedin';
import { type SqlFlavorOptions } from 'node_modules/@auth/drizzle-adapter/lib/utils';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string;
            githubAuthToken: string;
            linkedinAuthToken: string;
            isAdmin: boolean;
            isRecruiter: boolean;
            isCandidate: boolean;
        } & DefaultSession['user'];
    }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

export const authConfig = {
    providers: [
        GithubProvider({
            clientId: env.AUTH_GITHUB_ID,
            clientSecret: env.AUTH_GITHUB_SECRET,
            allowDangerousEmailAccountLinking: true,
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: profile.name ?? profile.login,
                    email: profile.email,
                    image: profile.avatar_url,
                    githubUsername: profile.login,
                };
            },
        }),
        LinkedInProvider({
            clientId: env.AUTH_LINKEDIN_ID,
            clientSecret: env.AUTH_LINKEDIN_SECRET,
            allowDangerousEmailAccountLinking: true,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                };
            },
        }),
        /**
         * ...add more providers here.
         *
         * Most other providers require a bit more work than the Discord provider. For example, the
         * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
         * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
         *
         * @see https://next-auth.js.org/providers/github
         */
    ],
    adapter: DrizzleAdapter<SqlFlavorOptions>(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    callbacks: {
        session: async ({ session, user }) => {
            const adminProfile = await db.query.adminProfiles.findFirst({
                where: (a, { eq }) => eq(a.userId, user.id),
            });

            const recruiterProfile = await db.query.recruiterProfiles.findFirst({
                where: (r, { eq }) => eq(r.userId, user.id),
            });
            const candidateProfile = await db.query.candidateProfiles.findFirst({
                where: (c, { eq }) => eq(c.userId, user.id),
            });

            return {
                ...session,
                user: {
                    ...session.user,
                    id: user.id,
                    isAdmin: !!adminProfile,
                    isRecruiter: !!recruiterProfile,
                    isCandidate: !!candidateProfile,
                },
            };
        },
    },
} satisfies NextAuthConfig;
