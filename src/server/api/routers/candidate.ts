import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { users } from '@/server/db/schemas/auth';
import { candidateProfiles } from '@/server/db/schemas/profiles';
import { candidateProfilesToProjectInstances } from '@/server/db/schemas/projects';
import { TRPCError } from '@trpc/server';
import { and, eq, inArray, like, or, sql } from 'drizzle-orm';
import { z } from 'zod';

export const candidateRouter = createTRPCRouter({
    getOne: publicProcedure.input(z.union([z.object({ id: z.cuid2() }), z.object({ githubUsername: z.string() })])).query(async ({ ctx, input }) => {
        if ('id' in input) {
            return ctx.db.query.candidateProfiles.findFirst({
                where: (candidateProfiles, { eq }) => eq(candidateProfiles.userId, input.id),
                with: {
                    user: true,
                    candidateProfilesToProjects: {
                        with: {
                            project: true,
                        },
                    },
                },
            });
        } else {
            // Search by githubUsername - first find user, then get their profile
            const user = await ctx.db.query.users.findFirst({
                where: (users, { eq }) => eq(users.githubUsername, input.githubUsername),
            });

            if (!user) return null;

            return ctx.db.query.candidateProfiles.findFirst({
                where: (candidateProfiles, { eq }) => eq(candidateProfiles.userId, user.id),
                with: {
                    user: {
                        columns: {
                            githubUsername: true,
                        },
                    },
                    candidateProfilesToProjects: {
                        with: {
                            project: true,
                        },
                    },
                },
            });
        }
    }),

    updateOne: adminProcedure
        .input(
            z
                .object({
                    id: z.cuid2(),
                    location: z.string(),
                    language: z.string(),
                    resumeURL: z.string(),
                    displayName: z.string(),
                    bio: z.string(),
                    experience: z.string(),
                    githubUsername: z.string(),
                    portfolioURL: z.string(),
                    linkedinURL: z.string(),
                    imageUrl: z.string(),
                })
                .partial()
                .required({ id: true })
        )
        .mutation(async ({ ctx, input }) => {
            const updatedData = Object.fromEntries(Object.entries(input).filter(([key, value]) => key !== 'id' && value !== undefined));
            return ctx.db.update(candidateProfiles).set(updatedData).where(eq(candidateProfiles.userId, input.id));
        }),

    deleteOne: adminProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
        return ctx.db.delete(candidateProfiles).where(eq(candidateProfiles.userId, input.id));
    }),

    deleteAll: adminProcedure.mutation(async ({ ctx }) => {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        return ctx.db.delete(candidateProfiles);
    }),

    updateMe: protectedProcedure
        .input(
            z
                .object({
                    displayName: z.string(),
                    bio: z.string(),
                    experience: z.string(),
                    location: z.string(),
                    language: z.string(),
                    resumeURL: z.string(),
                    githubUsername: z.string(),
                    portfolioURL: z.string(),
                    linkedinURL: z.url().startsWith('https://linkedin.com/in/', {
                        message: 'Must be a valid LinkedIn URL',
                    }),
                    imageUrl: z.url(),
                })
                .partial()
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db.update(candidateProfiles).set(input).where(eq(candidateProfiles.userId, ctx.session.user.id));
        }),

    deleteMe: protectedProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
        const candidateProfile = await ctx.db.query.candidateProfiles.findFirst({
            where: (candidateProfiles, { eq }) => eq(candidateProfiles.userId, input.id),
        });
        if (!candidateProfile || candidateProfile.userId !== ctx.session.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your profile' });
        }
        return ctx.db.delete(candidateProfiles).where(eq(candidateProfiles.userId, input.id));
    }),

    getProjects: publicProcedure.input(z.object({ userId: z.cuid2() })).query(async ({ ctx, input }) => {
        const candidateProfile = await ctx.db.query.candidateProfiles.findFirst({
            where: (candidateProfiles, { eq }) => eq(candidateProfiles.userId, input.userId),
            with: {
                candidateProfilesToProjects: {
                    with: {
                        project: {
                            with: {
                                projectsToTags: {
                                    with: { tag: true },
                                },
                                projectsToCandidateProfiles: true,
                            },
                        },
                    },
                },
            },
        });
        if (!candidateProfile) return null;
        return candidateProfile.candidateProfilesToProjects.filter((p) => p.visible).map((p) => p.project);
    }),

    changeProjectVisibility: protectedProcedure.input(z.object({ projectId: z.string(), visible: z.boolean() })).mutation(async ({ input, ctx }) => {
        const q = await ctx.db
            .update(candidateProfilesToProjectInstances)
            .set({ visible: input.visible })
            .where(and(eq(candidateProfilesToProjectInstances.projectId, input.projectId), eq(candidateProfilesToProjectInstances.candidateId, ctx.session.user.id)))
            .returning({
                newVisible: candidateProfilesToProjectInstances.visible,
                projectId: candidateProfilesToProjectInstances.projectId,
            });

        if (!q) throw new TRPCError({ code: 'NOT_FOUND' });

        if (q.length !== 1) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const newRow = q[0];

        return newRow!;
    }),

    searchCandidates: publicProcedure
        .input(
            z.object({
                name: z.string().optional(),
                location: z.string().optional(),
                language: z.string().optional(),
                experience: z.string().optional(),
                githubUsername: z.string().optional(),
                page: z.number().min(1).default(1),
                limit: z.number().min(1).max(50).default(12),
            })
        )
        .query(async ({ ctx, input }) => {
            const conditions = [];

            if (input.name) {
                conditions.push(or(like(candidateProfiles.displayName, `%${input.name}%`), like(candidateProfiles.bio, `%${input.name}%`)));
            }

            if (input.location) {
                conditions.push(like(candidateProfiles.location, `%${input.location}%`));
            }

            if (input.language) {
                conditions.push(like(candidateProfiles.language, `%${input.language}%`));
            }

            if (input.experience) {
                conditions.push(like(candidateProfiles.experience, `%${input.experience}%`));
            }

            // Handle GitHub username search separately since it requires joining with users table
            let githubUsernameCondition = undefined;
            if (input.githubUsername) {
                githubUsernameCondition = like(users.githubUsername, `%${input.githubUsername}%`);
            }

            const offset = (input.page - 1) * input.limit;

            let candidates;
            let totalCount;

            if (githubUsernameCondition) {
                // If searching by GitHub username, we need to join with users table
                const candidateIds = await ctx.db
                    .select({ userId: candidateProfiles.userId })
                    .from(candidateProfiles)
                    .innerJoin(users, eq(candidateProfiles.userId, users.id))
                    .where(and(...conditions, githubUsernameCondition))
                    .limit(input.limit)
                    .offset(offset);

                const userIds = candidateIds.map((c) => c.userId);

                candidates = await ctx.db.query.candidateProfiles.findMany({
                    where: inArray(candidateProfiles.userId, userIds),
                    with: {
                        user: {
                            columns: {
                                githubUsername: true,
                            },
                        },
                        candidateProfilesToProjects: {
                            with: {
                                project: true,
                            },
                        },
                    },
                });

                // Get total count for pagination
                const countResult = await ctx.db
                    .select({ count: sql<number>`count(*)` })
                    .from(candidateProfiles)
                    .innerJoin(users, eq(candidateProfiles.userId, users.id))
                    .where(and(...conditions, githubUsernameCondition));

                totalCount = countResult;
            } else {
                // Regular search without GitHub username
                candidates = await ctx.db.query.candidateProfiles.findMany({
                    where: conditions.length > 0 ? and(...conditions) : undefined,
                    with: {
                        user: {
                            columns: {
                                githubUsername: true,
                            },
                        },
                        candidateProfilesToProjects: {
                            with: {
                                project: true,
                            },
                        },
                    },
                    limit: input.limit,
                    offset: offset,
                });

                // Get total count for pagination
                totalCount = await ctx.db
                    .select({ count: sql<number>`count(*)` })
                    .from(candidateProfiles)
                    .where(conditions.length > 0 ? and(...conditions) : undefined);
            }

            return {
                candidates,
                pagination: {
                    page: input.page,
                    limit: input.limit,
                    total: totalCount[0]?.count || 0,
                    totalPages: Math.ceil((totalCount[0]?.count || 0) / input.limit),
                },
            };
        }),
});

export default candidateRouter;
