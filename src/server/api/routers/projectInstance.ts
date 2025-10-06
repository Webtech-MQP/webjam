import { sendJamStartEmail } from '@/lib/mailer';
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { candidateProfilesToProjectInstances, projectInstanceRatings, projectInstances, projects } from '@/server/db/schemas/projects';
import { TRPCError } from '@trpc/server';
import { and, eq, getTableColumns, gte } from 'drizzle-orm';
import z from 'zod';

export const projectInstanceRouter = createTRPCRouter({
    createJams: publicProcedure.input(z.object({ projectId: z.cuid2(), teams: z.array(z.array(z.string())) })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.query.projects.findFirst({
            where: (projects, { eq }) => eq(projects.id, input.projectId),
            with: {
                projectInstances: {
                    with: {
                        teamMembers: true,
                    },
                },
            },
        });

        if (!project) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }

        if (project.projectInstances.length > 0) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Project already has instances created' });
        }

        return Promise.all(
            input.teams.map(async (team, idx) => {
                const instance = await ctx.db
                    .insert(projectInstances)
                    .values({
                        projectId: input.projectId,
                        teamName: 'Team ' + String.fromCharCode(idx + 65),
                    })
                    .returning({ id: projectInstances.id });

                if (!instance || instance.length < 1) {
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create project instance' });
                }

                return Promise.all(
                    team.map(async (user) => {
                        try {
                            const candidate = await ctx.db.query.candidateProfiles.findFirst({
                                where: (candidateProfiles, { eq }) => eq(candidateProfiles.userId, user),
                                with: {
                                    user: true,
                                },
                            });

                            if (!candidate) {
                                throw new TRPCError({ code: 'NOT_FOUND', message: 'Candidate profile not found for user: ' + user });
                            }

                            sendJamStartEmail({
                                to: candidate.user.email,
                                name: candidate.displayName,
                                teamName: 'Team ' + String.fromCharCode(idx + 65),
                                jamName: project.title,
                                jamUrl: `${process.env.FRONTEND_URL}/dashboard/jams/${instance[0]!.id}`,
                                startEpoch: project.startDateTime.getTime(),
                                endEpoch: project.endDateTime.getTime(),
                            });
                        } catch (e) {
                            console.error('Error sending jam start email to user:', user, e);
                        }

                        return ctx.db.insert(candidateProfilesToProjectInstances).values({
                            projectInstanceId: instance[0]!.id,
                            candidateId: user,
                            visible: true,
                        });
                    })
                );
            })
        );
    }),

    getOne: publicProcedure.input(z.object({ id: z.cuid2() })).query(async ({ ctx, input }) => {
        return ctx.db.query.projectInstances.findFirst({
            where: (projectInstances, { eq }) => eq(projectInstances.id, input.id),
            with: {
                project: {
                    with: {
                        projectsToTags: {
                            with: {
                                tag: true,
                            },
                        },
                        creator: true,
                    },
                },
                teamMembers: {
                    with: {
                        candidateProfile: true,
                    },
                },
            },
        });
    }),

    updateOne: protectedProcedure
        .input(
            z
                .object({
                    id: z.cuid2(),
                    teamName: z.string(),
                    repoUrl: z
                        .string()
                        .refine((v) => v.match(/^(?:https:\/\/)?github.com\/[^\/]+\/[^\/]+\/?$/))
                        .or(z.string().length(0)),
                    projectId: z.string(),
                })
                .partial()
                .required({ id: true })
        )
        .mutation(async ({ ctx, input }) => {
            const updatedData = Object.fromEntries(Object.entries(input).filter(([key, value]) => key !== 'id' && value !== undefined));
            return ctx.db.update(projectInstances).set(updatedData).where(eq(projectInstances.id, input.id));
        }),

    getMyActive: protectedProcedure.input(z.object({ withProject: z.boolean().default(false) }).default({ withProject: false })).query(async ({ input, ctx }) => {
        return ctx.db
            .select({ ...getTableColumns(projectInstances), project: getTableColumns(projects) })
            .from(projectInstances)
            .innerJoin(candidateProfilesToProjectInstances, eq(candidateProfilesToProjectInstances.projectInstanceId, projectInstances.id))
            .innerJoin(projects, eq(projectInstances.projectId, projects.id))
            .where(and(eq(candidateProfilesToProjectInstances.candidateId, ctx.session.user.id), gte(projects.endDateTime, new Date())));
    }),

    createOrUpdateRating: protectedProcedure.input(z.object({ projectInstanceId: z.string(), rating: z.number().int().min(1).max(10) })).mutation(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        const { projectInstanceId, rating } = input;
        //checks
        const member = await ctx.db.query.candidateProfilesToProjectInstances.findFirst({
            where: (t, { and, eq }) => and(eq(t.projectInstanceId, input.projectInstanceId), eq(t.candidateId, userId)),
        });
        if (!member) throw new Error('Not a member of this project instance');
        const projectInstance = await ctx.db.query.projectInstances.findFirst({
            where: (i, { eq }) => eq(i.id, input.projectInstanceId),
            with: { project: true },
        });
        if (!projectInstance) throw new Error('Project instance not found');

        return ctx.db
            .insert(projectInstanceRatings)
            .values({
                projectInstanceId,
                ratedBy: userId,
                rating,
                ratedOn: new Date(),
            })
            .onConflictDoUpdate({
                target: [projectInstanceRatings.projectInstanceId, projectInstanceRatings.ratedBy],
                set: {
                    rating,
                    ratedOn: new Date(),
                },
            });
    }),

    getMyProjectInstanceRating: protectedProcedure.input(z.object({ projectInstanceId: z.cuid2() })).query(async ({ ctx, input }) => {
        return (
            (
                await ctx.db.query.projectInstanceRatings.findFirst({
                    where: (rating, { and, eq }) => and(eq(rating.projectInstanceId, input.projectInstanceId), eq(rating.ratedBy, ctx.session.user.id)),
                })
            )?.rating ?? null
        );
    }),

    getAvgProjectInstanceRating: adminProcedure.input(z.object({ projectInstanceId: z.cuid2() })).query(async ({ ctx, input }) => {
        const ratings = await ctx.db.query.projectInstanceRatings.findMany({
            where: (rating, { eq }) => eq(rating.projectInstanceId, input.projectInstanceId),
        });

        return ratings.reduce((acc, r) => acc + r.rating, 0) / (ratings.length || 1);
    }),

    getRank: publicProcedure.input(z.object({ projectInstanceId: z.cuid2() })).query(async ({ ctx, input }) => {
        const ranking = await ctx.db.query.projectInstanceRankings.findFirst({
            where: (projectInstanceRankings, { eq }) => eq(projectInstanceRankings.projectInstanceId, input.projectInstanceId),
        });

        if (!ranking) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Ranking not found for the given project instance' });
        }

        return ranking.rank;
    }),

    getMyProjectInstances: protectedProcedure.query(async ({ ctx }) => {
        const results = await ctx.db.query.candidateProfilesToProjectInstances.findMany({
            where: (candidateProfilesToProjectInstances, { eq }) => eq(candidateProfilesToProjectInstances.candidateId, ctx.session.user.id),
            with: {
                projectInstance: {
                    with: {
                        project: true,
                    },
                },
            },
        });

        return results.map((result) => result.projectInstance);
    }),
});
