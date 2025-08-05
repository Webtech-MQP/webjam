import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';
import { adminProfiles } from '@/server/db/schemas/profiles';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const adminRouter = createTRPCRouter({
    getOne: adminProcedure.input(z.object({ id: z.cuid2() })).query(async ({ ctx, input }) => {
        return ctx.db.query.adminProfiles.findFirst({
            where: (adminProfiles, { eq }) => eq(adminProfiles.userId, input.id),
            with: {
                user: true,
            },
        });
    }),

    getAll: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.query.adminProfiles.findMany({
            with: {
                user: true,
            },
        });
    }),

    updateOne: adminProcedure
        .input(
            z.object({
                id: z.cuid2(),
                adminRole: z.enum(['Reg', 'Mod', 'Super', 'idk']).optional(),
                displayName: z.string().optional(),
                bio: z.string().optional(),
                imageUrl: z.string().optional(),
                contactEmail: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const updatedData = Object.fromEntries(Object.entries(input).filter(([key, value]) => key !== 'id' && value !== undefined));
            return ctx.db.update(adminProfiles).set(updatedData).where(eq(adminProfiles.userId, input.id));
        }),

    updateMe: adminProcedure
        .input(
            z.object({
                id: z.cuid2(),
                displayName: z.string().optional(),
                bio: z.string().optional(),
                imageUrl: z.string().optional(),
                contactEmail: z.string().optional(),
                adminRole: z.enum(['Reg', 'Mod', 'Super', 'idk']).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const adminProfile = await ctx.db.query.adminProfiles.findFirst({
                where: (adminProfiles, { eq }) => eq(adminProfiles.userId, input.id),
            });
            if (!adminProfile || adminProfile.userId !== ctx.session.user.id) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your profile' });
            }
            const updatedData = Object.fromEntries(Object.entries(input).filter(([key, value]) => key !== 'id' && value !== undefined));
            return ctx.db.update(adminProfiles).set(updatedData).where(eq(adminProfiles.userId, input.id));
        }),

    deleteOne: adminProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
        return ctx.db.delete(adminProfiles).where(eq(adminProfiles.userId, input.id));
    }),

    deleteAll: adminProcedure.mutation(async ({ ctx }) => {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        return ctx.db.delete(adminProfiles);
    }),

    deleteMe: adminProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
        return ctx.db.delete(adminProfiles).where(eq(adminProfiles.userId, input.id));
    }),
});

export default adminRouter;
