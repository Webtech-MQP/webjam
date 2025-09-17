import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { listCandidates, recruiterProfiles } from '@/server/db/schemas/profiles';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
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

        return ctx.db.delete(listCandidates).where(eq(listCandidates.listId, input.listId) && eq(listCandidates.candidateId, input.candidateId));
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
