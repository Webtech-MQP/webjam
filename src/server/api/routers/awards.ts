import { deleteS3Object, getS3KeyFromUrl } from '@/lib/s3';
import { adminProcedure, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { awards, candidateAward } from '@/server/db/schemas/awards';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const awardRouter = createTRPCRouter({
    createAward: adminProcedure
        .input(
            z.object({
                title: z.string().min(1).max(256),
                description: z.string().min(1).max(1000),
                imageUrl: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db.insert(awards).values({
                title: input.title,
                description: input.description,
                imageUrl: input.imageUrl,
            });
        }),

    updateOne: adminProcedure
        .input(
            z.object({
                id: z.cuid2(),
                title: z.string().min(1).max(256),
                description: z.string().min(1).max(1000),
                imageUrl: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const currentAward = await ctx.db.query.awards.findFirst({
                where: eq(awards.id, input.id),
            });

            if (input.imageUrl && currentAward?.imageUrl && currentAward.imageUrl !== input.imageUrl) {
                const oldKey = getS3KeyFromUrl(currentAward.imageUrl);
                if (oldKey) await deleteS3Object(oldKey);
            }

            return ctx.db.update(awards).set(input).where(eq(awards.id, input.id));
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
});

export default awardRouter;
