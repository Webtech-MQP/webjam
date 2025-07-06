import { z } from "zod";
import { eq } from "drizzle-orm";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { projects } from "@/server/db/schema";

export const projectRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ title: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(projects).values({
        title: input.title,
      });
    }),

  getOne: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.projects.findFirst({
        where: (projects, { eq }) => eq(projects.id, input.id),
        with: {
          usersToProjects: {
            with: {
              user: true,
            },
          },
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.projects.findMany({
      with: {
        usersToProjects: {
          with: {
            user: true,
          },
        },
        tagsToProjects: {
          with: {
            tag: true,
          },
        },
        ratings: {
          with: {
            user: true,
          },
        },
      },
    });
  }),

  updateOne: publicProcedure
    .input(
      z.object({ id: z.string().cuid2(), title: z.string().min(1).max(255) }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(projects)
        .set({ title: input.title })
        .where(eq(projects.id, input.id));
    }),

  deleteOne: protectedProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(projects).where(eq(projects.id, input.id));
    }),

  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return ctx.db.delete(projects);
  }),
});
