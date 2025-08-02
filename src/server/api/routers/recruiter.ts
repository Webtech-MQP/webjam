import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { recruiterProfiles } from '@/server/db/schemas/profiles';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const recruiterRouter = createTRPCRouter({
    getOne: publicProcedure.input(z.object({ id: z.cuid2() })).query(async ({ ctx, input }) => {
        return ctx.db.query.recruiterProfiles.findFirst({
            where: (recruiterProfiles, { eq }) => eq(recruiterProfiles.userId, input.id),
            with: {
                user: true,
            },
        });
    }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.query.recruiterProfiles.findMany({
            with: {
                user: true,
            },
        });
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
});

export default recruiterRouter;
