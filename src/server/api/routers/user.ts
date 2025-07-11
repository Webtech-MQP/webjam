import { z } from "zod";
import { eq } from "drizzle-orm";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { admins, users } from "@/server/db/schemas/users";

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1).max(255),
        middleName: z.string().optional(),
        lastName: z.string().min(1).max(255),
        email: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(users).values({
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        email: input.email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),

  getOne: publicProcedure
    .input(
      z.union([
        z.object({ id: z.string().cuid2() }),
        z.object({ githubUsername: z.string() }),
      ]),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where:
          "id" in input
            ? (users, { eq }) => eq(users.id, input.id)
            : (users, { eq }) => eq(users.githubUsername, input.githubUsername),
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

  updateOne: adminProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        firstName: z.string().min(1).max(255),
        middleName: z.string().optional(),
        lastName: z.string().min(1).max(255),
        email: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(users)
        .set({
          firstName: input.firstName,
          middleName: input.middleName,
          lastName: input.lastName,
          email: input.email,
        })
        .where(eq(users.id, input.id));
    }),

  deleteOne: adminProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(users).where(eq(users.id, input.id));
    }),

  deleteAll: adminProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return ctx.db.delete(users);
  }),

  isAdmin: protectedProcedure.query(async ({ ctx }) => {
    const isAdmin = !!(
      await ctx.db
        .select()
        .from(users)
        .innerJoin(admins, eq(users.id, admins.userId))
        .where(eq(users.id, ctx.session.user.id))
        .limit(1)
    )[0];
    return isAdmin;
  }),
});

export default userRouter;
