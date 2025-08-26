import { adminProcedure, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { adminProfiles } from '@/server/db/schemas/profiles';
import { projectInstances, projects, projectSubmissionRating, projectSubmissions } from '@/server/db/schemas/projects';
import { and, eq, getTableColumns, gte, lt, sql } from 'drizzle-orm';
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
            },
        });
    }),

    getAllSubmissionsForProject: adminProcedure.input(z.object({ projectId: z.cuid2() })).query(async ({ ctx, input }) => {
        const submissions = await ctx.db
            .select({ ...getTableColumns(projectSubmissions), projectInstance: projectInstances, reviewer: adminProfiles, project: projects })
            .from(projectSubmissions)
            .innerJoin(projectInstances, eq(projectInstances.id, projectSubmissions.projectInstanceId))
            .innerJoin(projects, eq(projects.id, projectInstances.projectId))
            .leftJoin(adminProfiles, eq(adminProfiles.userId, projectSubmissions.reviewedBy))
            .where(eq(projectInstances.projectId, input.projectId));

        return submissions.map((s) => ({ ...s, projectInstance: { ...s.projectInstance, project: s.project }, project: undefined }));
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
});

export default projectSubmissionRouter;
