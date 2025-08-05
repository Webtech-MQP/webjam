import { adminProcedure, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { awards, candidateAward, projectAward } from '@/server/db/schemas/awards';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

export const awardsRouter = createTRPCRouter({
    createAward: adminProcedure
        .input(
            z.object({
                title: z.string().min(1).max(256),
                description: z.string().min(1).max(1000),
                imageURL: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db.insert(awards).values({
                title: input.title,
                description: input.description,
                imageURL: input.imageURL,
            });
        }),

    attachAwardToProject: adminProcedure
        .input(
            z.object({
                projectId: z.cuid2(),
                awardId: z.cuid2(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db.insert(projectAward).values({
                projectId: input.projectId,
                awardId: input.awardId,
            });
        }),

    getAll: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.query.awards.findMany({});
    }),

    getUserAwards: protectedProcedure.input(z.object({ userId: z.cuid2() })).query(async ({ ctx, input }) => {
        return ctx.db.query.candidateAward.findMany({
            where: (candidateAward, { eq }) => eq(candidateAward.userId, input.userId),
            with: {
                award: true,
            },
            orderBy: (candidateAward, { asc }) => [asc(candidateAward.displayOrder)],
        });
    }),

    getVisibleUserAwards: protectedProcedure.input(z.object({ userId: z.cuid2() })).query(async ({ ctx, input }) => {
        return ctx.db.query.candidateAward.findMany({
            where: (candidateAward, { and, eq }) => and(eq(candidateAward.userId, input.userId), eq(candidateAward.isVisible, true)),
            with: {
                award: true,
            },
            orderBy: (candidateAward, { asc }) => [asc(candidateAward.displayOrder)],
        });
    }),

    updateAwardOrder: protectedProcedure
        .input(
            z.object({
                orders: z.array(z.object({ id: z.cuid2(), displayOrder: z.number() })),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            await ctx.db.transaction(async (tx) => {
                for (const { id, displayOrder } of input.orders) {
                    await tx
                        .update(candidateAward)
                        .set({ displayOrder })
                        .where(and(eq(candidateAward.userId, userId), eq(candidateAward.id, id)));
                }
            });
            return true;
        }),

    updateAwardVisibilities: protectedProcedure
        .input(
            z.object({
                updates: z.array(
                    z.object({
                        id: z.cuid2(),
                        isVisible: z.boolean(),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            await ctx.db.transaction(async (tx) => {
                for (const { id, isVisible } of input.updates) {
                    await tx
                        .update(candidateAward)
                        .set({ isVisible })
                        .where(and(eq(candidateAward.userId, userId), eq(candidateAward.id, id)));
                }
            });

            return true;
        }),

    deleteAward: adminProcedure.input(z.object({ awardId: z.cuid2() })).mutation(async ({ ctx, input }) => {
        return ctx.db.delete(awards).where(eq(awards.id, input.awardId));
    }),

    grantProjectAward: protectedProcedure
        .input(
            z.object({
                userId: z.cuid2(),
                awardId: z.cuid2(),
                projectSubmissionId: z.cuid2(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const existingAwards = await ctx.db.select().from(candidateAward).where(eq(candidateAward.userId, input.userId)).orderBy(desc(candidateAward.displayOrder)).limit(1);
            const displayOrder = (existingAwards[0]?.displayOrder ?? 0) + 1;

            return ctx.db.insert(candidateAward).values({
                userId: input.userId,
                awardId: input.awardId,
                projectSubmissionId: input.projectSubmissionId,
                displayOrder,
                isVisible: true,
            });
        }),
});

export default awardsRouter;
