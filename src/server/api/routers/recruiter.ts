import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { listCandidates, lists, recruiterProfiles } from '@/server/db/schemas/profiles';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const recruiterRouter = createTRPCRouter({
    getOne: publicProcedure.input(z.object({ id: z.cuid2() })).query(async ({ ctx, input }) => {
        if ('id' in input) {
            const r = await ctx.db.query.recruiterProfiles.findFirst({
                where: (recruiterProfiles, { eq }) => eq(recruiterProfiles.userId, input.id),
                with: {
                    user: true,
                },
            });

            return r ?? null;
        }
    }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.query.recruiterProfiles.findMany({
            with: {
                user: true,
            },
        });
    }),

    getLists: protectedProcedure.input(z.object({ id: z.cuid2() })).query(async ({ ctx, input }) => {
        const recruiterProfile = await ctx.db.query.recruiterProfiles.findFirst({
            where: (recruiterProfiles, { eq }) => eq(recruiterProfiles.userId, input.id),
        });

        if (!recruiterProfile || recruiterProfile.userId !== ctx.session.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your profile' });
        }

        const lists = await ctx.db.query.lists.findMany({
            where: (lists, { eq }) => eq(lists.recruiterId, input.id),
            with: {
                candidates: {
                    with: {
                        candidateProfile: {
                            with: {
                                user: true,
                            },
                        },
                    },
                },
            },
        });

        return lists;
    }),

    createOneList: protectedProcedure.input(z.object({ name: z.string().min(1).max(100), description: z.string().max(255).optional() })).mutation(async ({ ctx, input }) => {
        await ctx.db.insert(lists).values({
            name: input.name,
            description: input.description ?? '',
            recruiterId: ctx.session.user.id,
        });
    }),

    createOneListCandidate: protectedProcedure.input(z.object({ listId: z.cuid2(), candidateId: z.cuid2(), comments: z.string().optional() })).mutation(async ({ ctx, input }) => {
        const list = await ctx.db.query.lists.findFirst({
            where: (lists, { eq }) => eq(lists.id, input.listId),
        });

        if (!list) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'List not found' });
        }

        if (list.recruiterId !== ctx.session.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your list' });
        }

        const existingEntry = await ctx.db.query.listCandidates.findFirst({
            where: (lc, { eq }) => and(eq(lc.listId, input.listId), eq(lc.candidateId, input.candidateId)),
        });

        if (existingEntry) {
            throw new TRPCError({ code: 'CONFLICT', message: 'Candidate already in list' });
        }

        return ctx.db.insert(listCandidates).values({
            listId: input.listId,
            candidateId: input.candidateId,
            comments: input.comments ?? '',
        });
    }),

    deleteOneList: protectedProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
        const list = await ctx.db.query.lists.findFirst({
            where: (lists, { eq }) => eq(lists.id, input.id),
        });

        if (!list) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'List not found' });
        }

        if (list.recruiterId !== ctx.session.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your list' });
        }

        return ctx.db.delete(lists).where(eq(lists.id, input.id));
    }),

    removeCandidateFromList: protectedProcedure.input(z.object({ listId: z.cuid2(), candidateId: z.cuid2() })).mutation(async ({ ctx, input }) => {
        const list = await ctx.db.query.lists.findFirst({
            where: (lists, { eq }) => eq(lists.id, input.listId),
        });

        if (!list) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'List not found' });
        }

        if (list.recruiterId !== ctx.session.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your list' });
        }

        return ctx.db.delete(listCandidates).where(and(eq(listCandidates.listId, input.listId), eq(listCandidates.candidateId, input.candidateId)));
    }),

    moveCandidateToList: protectedProcedure
        .input(
            z.object({
                candidateId: z.cuid2(),
                fromListId: z.cuid2(),
                toListId: z.cuid2(),
                comments: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check ownership of both lists
            const fromList = await ctx.db.query.lists.findFirst({
                where: (lists, { eq }) => eq(lists.id, input.fromListId),
            });
            const toList = await ctx.db.query.lists.findFirst({
                where: (lists, { eq }) => eq(lists.id, input.toListId),
            });
            if (!fromList || !toList) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'List not found' });
            }
            if (fromList.recruiterId !== ctx.session.user.id || toList.recruiterId !== ctx.session.user.id) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your list' });
            }

            // Check if candidate already exists in target list
            const existingInTarget = await ctx.db.query.listCandidates.findFirst({
                where: (lc, { eq }) => and(eq(lc.listId, input.toListId), eq(lc.candidateId, input.candidateId)),
            });
            if (existingInTarget) {
                throw new TRPCError({ code: 'CONFLICT', message: 'Candidate already in target list' });
            }

            // Get existing comment from source list
            const candidateEntry = await ctx.db.query.listCandidates.findFirst({
                where: (lc, { eq }) => and(eq(lc.listId, input.fromListId), eq(lc.candidateId, input.candidateId)),
            });
            const commentToUse = input.comments ?? candidateEntry?.comments ?? '';
            // Remove from source list
            await ctx.db.delete(listCandidates).where(and(eq(listCandidates.listId, input.fromListId), eq(listCandidates.candidateId, input.candidateId)));
            // Add to target list
            const lc = await ctx.db.insert(listCandidates).values({
                listId: input.toListId,
                candidateId: input.candidateId,
                comments: commentToUse,
            });

            return lc;
        }),

    updateOneListCandidate: protectedProcedure.input(z.object({ listId: z.cuid2(), candidateId: z.cuid2(), comments: z.string().optional() })).mutation(async ({ ctx, input }) => {
        const list = await ctx.db.query.lists.findFirst({
            where: (lists, { eq }) => eq(lists.id, input.listId),
        });

        if (!list) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'List not found' });
        }

        if (list.recruiterId !== ctx.session.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your list' });
        }

        const candidateEntry = await ctx.db.query.listCandidates.findFirst({
            where: (lc, { eq }) => and(eq(lc.listId, input.listId), eq(lc.candidateId, input.candidateId)),
        });

        if (!candidateEntry) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Candidate not in list' });
        }

        return ctx.db
            .update(listCandidates)
            .set({ comments: input.comments ?? '' })
            .where(and(eq(listCandidates.listId, input.listId), eq(listCandidates.candidateId, input.candidateId)));
    }),

    updateOne: adminProcedure
        .input(
            z.object({
                id: z.cuid2(),
                companyName: z.string().optional(),
                location: z.string().optional(),
                displayName: z.string().optional(),
                bio: z.string().optional(),
                companyWebsite: z.string().optional(),
                linkedinURL: z.string().optional(),
                imageUrl: z.string().optional(),
                publicEmail: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const updatedData = Object.fromEntries(Object.entries(input).filter(([key, value]) => key !== 'id' && value !== undefined));
            return ctx.db.update(recruiterProfiles).set(updatedData).where(eq(recruiterProfiles.userId, input.id));
        }),

    updateMe: protectedProcedure
        .input(
            z.object({
                id: z.cuid2(),
                displayName: z.string().optional(),
                companyName: z.string().optional(),
                location: z.string().optional(),
                bio: z.string().optional(),
                companyWebsite: z.string().optional(),
                linkedinURL: z.string().optional(),
                imageUrl: z.string().optional(),
                publicEmail: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const recruiterProfile = await ctx.db.query.recruiterProfiles.findFirst({
                where: (recruiterProfiles, { eq }) => eq(recruiterProfiles.userId, input.id),
            });
            if (!recruiterProfile || recruiterProfile.userId !== ctx.session.user.id) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your profile' });
            }
            const updatedData = Object.fromEntries(Object.entries(input).filter(([key, value]) => key !== 'id' && value !== undefined));
            return ctx.db.update(recruiterProfiles).set(updatedData).where(eq(recruiterProfiles.userId, input.id));
        }),

    deleteOne: adminProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
        return ctx.db.delete(recruiterProfiles).where(eq(recruiterProfiles.userId, input.id));
    }),

    deleteAll: adminProcedure.mutation(async ({ ctx }) => {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        return ctx.db.delete(recruiterProfiles);
    }),

    deleteMe: protectedProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
        const recruiterProfile = await ctx.db.query.recruiterProfiles.findFirst({
            where: (recruiterProfiles, { eq }) => eq(recruiterProfiles.userId, input.id),
        });
        if (!recruiterProfile || recruiterProfile.userId !== ctx.session.user.id) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your profile' });
        }
        return ctx.db.delete(recruiterProfiles).where(eq(recruiterProfiles.userId, input.id));
    }),

    createMe: protectedProcedure
        .input(
            z.strictObject({
                displayName: z.string(),
                bio: z.string(),
                location: z.string().default(''),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const user = await ctx.db.query.users.findFirst({
                where: (users, { eq }) => eq(users.id, ctx.session.user.id),
            });

            const existingProfile = await ctx.db.query.recruiterProfiles.findFirst({
                where: (recruiterProfiles, { eq }) => eq(recruiterProfiles.userId, ctx.session.user.id),
            });

            if (existingProfile) {
                throw new TRPCError({ code: 'CONFLICT', message: 'Profile already exists' });
            }

            return ctx.db.insert(recruiterProfiles).values({
                userId: ctx.session.user.id,
                displayName: input.displayName,
                bio: input.bio,
                location: input.location,
                imageUrl: user?.image,
            });
        }),
});

export default recruiterRouter;
