import { adminProcedure, createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { users } from '@/server/db/schemas/auth';
import { adminProfiles } from '@/server/db/schemas/profiles';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const userRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                name: z.string().min(1).max(255),
                email: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db.insert(users).values({
                name: input.name,
                email: input.email,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }),

    getOne: publicProcedure.input(z.union([z.object({ id: z.cuid2() }), z.object({ githubUsername: z.string() })])).query(async ({ ctx, input }) => {
        return ctx.db.query.users.findFirst({
            where: 'id' in input ? (users, { eq }) => eq(users.id, input.id) : (users, { eq }) => eq(users.githubUsername, input.githubUsername),
        });
    }),

    getUsers: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.query.users.findMany({});
    }),

    updateOne: adminProcedure
        .input(
            z.object({
                id: z.cuid2(),
                name: z.string().min(1).max(255),
                email: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db
                .update(users)
                .set({
                    name: input.name,
                    email: input.email,
                })
                .where(eq(users.id, input.id));
        }),

    deleteOne: adminProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
        return ctx.db.delete(users).where(eq(users.id, input.id));
    }),

    deleteAll: adminProcedure.mutation(async ({ ctx }) => {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        return ctx.db.delete(users);
    }),

    isAdmin: publicProcedure.query(async ({ ctx }) => {
        if (!ctx.session?.user?.id) {
            return false;
        }

        const isAdmin = !!(await ctx.db.select().from(users).innerJoin(adminProfiles, eq(users.id, adminProfiles.userId)).where(eq(users.id, ctx.session.user.id)).limit(1))[0];
        return isAdmin;
    }),
});

export default userRouter;
