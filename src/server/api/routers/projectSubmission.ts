import { adminProcedure, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { projectInstances, projectSubmissionRating, projectSubmissions } from '@/server/db/schemas/projects';
import { TRPCError } from '@trpc/server';
import { and, eq, gte, lt, sql } from 'drizzle-orm';
import { z } from 'zod';

export const projectSubmissionRouter = createTRPCRouter({
    getOne: protectedProcedure.input(z.object({ id: z.cuid2() })).query(async ({ ctx, input }) => {
        return ctx.db.query.projectSubmissions.findFirst({
            where: (projectSubmissions, { eq }) => eq(projectSubmissions.id, input.id),
        });
    }),

    createOne: protectedProcedure
        .input(
            z.object({
                id: z.cuid2(),
                projectInstanceId: z.cuid2(),
                submittedBy: z.cuid2(),
                repositoryURL: z.url(),
                deploymentURL: z.url(),
                submittedOn: z.date(),
                status: z.enum(['submitted', 'under-review', 'approved', 'denied']).default('submitted'),
            })
        )
        .mutation(async ({ ctx, input }) => {
            console.log(input);
            await ctx.db.insert(projectSubmissions).values({
                id: input.id,
                projectInstanceId: input.projectInstanceId,
                submittedBy: input.submittedBy,
                repositoryURL: input.repositoryURL,
                deploymentURL: input.deploymentURL,
                submittedOn: input.submittedOn,
                status: input.status,
                notes: '',
            });
        }),

    getAllSubmissionsForProjectInstance: protectedProcedure.input(z.object({ projectInstanceId: z.cuid2() })).query(async ({ ctx, input }) => {
        return ctx.db.query.projectSubmissions.findMany({
            where: (projectSubmissions, { eq }) => eq(projectSubmissions.projectInstanceId, input.projectInstanceId),
            with: {
                projectInstance: {
                    with: {
                        project: true,
                    },
                },
                reviewer: true,
                ratings: {
                    columns: {
                        ratedBy: false,
                    },
                },
            },
        });
    }),

    getAllSubmissionsForProject: adminProcedure.input(z.object({ projectId: z.cuid2() })).query(async ({ ctx, input }) => {
        // There has got to be a more performant way to do this that isn't insanely painful
        const pi = await ctx.db.select().from(projectInstances).where(eq(projectInstances.projectId, input.projectId));

        const submissions = await ctx.db.query.projectSubmissions.findMany({
            where: (projectSubmissions, { inArray }) =>
                inArray(
                    projectSubmissions.projectInstanceId,
                    pi.map((p) => p.id)
                ),
            with: {
                projectInstance: {
                    with: {
                        project: true,
                    },
                },
                reviewer: true,
                ratings: {
                    columns: {
                        ratedBy: false,
                    },
                },
            },
        });

        return submissions;
    }),

    getAll: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.query.projectSubmissions.findMany({
            with: {
                projectInstance: {
                    with: {
                        project: true,
                    },
                },
                reviewer: true,

                ratings: {
                    columns: {
                        ratedBy: false,
                    },
                },
            },
        });
    }),

    getPendingSubmissions: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.query.projectSubmissions.findMany({
            where: (projectSubmissions, { inArray }) => inArray(projectSubmissions.status, ['submitted', 'under-review']),
            with: {
                projectInstance: {
                    with: {
                        project: true,
                    },
                },
                reviewer: true,
                ratings: {
                    columns: {
                        ratedBy: false,
                    },
                },
            },
        });
    }),

    getTodayCount: adminProcedure.query(async ({ ctx }) => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        return ctx.db
            .select({ count: sql<number>`count(*)` })
            .from(projectSubmissions)
            .where(and(gte(projectSubmissions.submittedOn, startOfToday), lt(projectSubmissions.submittedOn, startOfTomorrow)))
            .get();
    }),

    updateOne: adminProcedure.input(z.object({ id: z.cuid2(), status: z.string() })).mutation(async ({ ctx, input }) => {
        return ctx.db
            .update(projectSubmissions)
            .set({
                status: input.status as 'submitted' | 'under-review' | 'approved' | 'denied',
            })
            .where(eq(projectSubmissions.id, input.id));
    }),

    deleteOne: adminProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
        return ctx.db.delete(projectSubmissions).where(eq(projectSubmissions.id, input.id));
    }),

    deleteAll: adminProcedure.mutation(async ({ ctx }) => {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        return ctx.db.delete(projectSubmissions);
    }),

    rateSubmission: adminProcedure.input(z.object({ id: z.cuid2(), rating: z.number().min(1).max(10) })).mutation(async ({ ctx, input }) => {
        const p = await ctx.db.query.projects.findFirst({
            with: {
                projectInstances: {
                    with: {
                        submission: {
                            where: (submissions, { eq }) => eq(submissions.id, input.id),
                        },
                    },
                },
            },
        });

        if (!p) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
        }

        if (p.status !== 'judging') {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only rate submissions in judgement status' });
        }

        const q = await ctx.db
            .insert(projectSubmissionRating)
            .values({
                submissionId: input.id,
                rating: input.rating,
                ratedBy: ctx.session.user.id,
            })
            .onConflictDoUpdate({
                target: [projectSubmissionRating.submissionId, projectSubmissionRating.ratedBy],
                set: {
                    rating: input.rating,
                    ratedBy: ctx.session.user.id,
                    ratedOn: sql`(unixepoch())`,
                },
            });

        return q.rows[0];
    }),

    getMyRating: adminProcedure.input(z.object({ submissionId: z.cuid2() })).query(async ({ ctx, input }) => {
        return (
            (
                await ctx.db.query.projectSubmissionRating.findFirst({
                    where: (rating, { and, eq }) => and(eq(rating.submissionId, input.submissionId), eq(rating.ratedBy, ctx.session.user.id)),
                })
            )?.rating ?? null
        );
    }),

    getAvgRating: adminProcedure.input(z.object({ submissionId: z.cuid2() })).query(async ({ ctx, input }) => {
        const ratings = await ctx.db.query.projectSubmissionRating.findMany({
            where: (rating, { eq }) => eq(rating.submissionId, input.submissionId),
        });

        return ratings.reduce((acc, r) => acc + r.rating, 0) / (ratings.length || 1);
    }),
});

export default projectSubmissionRouter;
