import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { projectSubmissions } from '@/server/db/schemas/projects';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const projectSubmissionRouter = createTRPCRouter({
    getOne: publicProcedure.input(z.object({ id: z.cuid2() })).query(async ({ ctx, input }) => {
        return ctx.db.query.projectSubmissions.findFirst({
            where: (projectSubmissions, { eq }) => eq(projectSubmissions.id, input.id),
        });
    }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.query.projectSubmissions.findMany({
            with: {
                project: true,
            },
        });
    }),

    updateOne: publicProcedure.input(z.object({ id: z.cuid2(), status: z.string() })).mutation(async ({ ctx, input }) => {
        return ctx.db
            .update(projectSubmissions)
            .set({
                status: input.status as 'submitted' | 'under-review' | 'approved',
            })
            .where(eq(projectSubmissions.id, input.id));
    }),

    deleteOne: publicProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
        return ctx.db.delete(projectSubmissions).where(eq(projectSubmissions.id, input.id));
    }),

    deleteAll: publicProcedure.mutation(async ({ ctx }) => {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        return ctx.db.delete(projectSubmissions);
    }),
});

export default projectSubmissionRouter;
