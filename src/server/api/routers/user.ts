import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schemas/users";

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string(),
        image: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(users).values({
        name: input.name,
        email: input.email,
        image: input.image,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),

  getOne: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, input.id),
        with: {
          candidate: {
            with: {
              candidatesToProjects: {
                with: {
                  project: true,
                },
              },
            },
          },
          admin: true,
          recruiter: true,
        },
      });
    }),

  getUsers: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findMany({});
  }),

  getCandidates: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.candidates.findMany({
      with: {
        user: true,
      },
    });
  }),

  updateOne: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255),
        email: z.string(),
        image: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(users)
        .set({ name: input.name, email: input.email, image: input.image })
        .where(eq(users.id, input.id));
    }),

  deleteOne: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(users).where(eq(users.id, input.id));
    }),

  deleteAll: publicProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return ctx.db.delete(users);
  }),
});

export default userRouter;
