import { createTRPCRouter, adminProcedure } from '@/server/api/trpc';
import { projectSubmissions } from '@/server/db/schemas/projects';
import { sql, eq, and, gte, lt } from 'drizzle-orm';
import { z } from 'zod';

export const projectSubmissionRouter = createTRPCRouter({
    getOne: adminProcedure.input(z.object({ id: z.cuid2() })).query(async ({ ctx, input }) => {
        return ctx.db.query.projectSubmissions.findFirst({
            where: (projectSubmissions, { eq }) => eq(projectSubmissions.id, input.id),
        });
    }),

    getAll: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.query.projectSubmissions.findMany({
            with: {
                project: true,
                reviewer: true,
            },
        });
    }),

    getPendingSubmissions: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.query.projectSubmissions.findMany({
            where: (projectSubmissions, { inArray }) =>
                inArray(projectSubmissions.status, ['submitted', 'under-review']),
            with: {
                project: true,
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
            .where(and(
                gte(projectSubmissions.submittedOn, startOfToday),
                lt(projectSubmissions.submittedOn, startOfTomorrow),
            ))
            .get();
    }),

    updateOne: adminProcedure.input(z.object({ id: z.cuid2(), status: z.string() })).mutation(async ({ ctx, input }) => {
        return ctx.db
            .update(projectSubmissions)
            .set({
                status: input.status as 'submitted' | 'under-review' | 'approved',
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
});

export default projectSubmissionRouter;
