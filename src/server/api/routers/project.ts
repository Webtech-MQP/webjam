import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
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
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.projects.findFirst({
        where: (projects, { eq }) => eq(projects.id, input.id),
        with: {
          usersToProjects: true
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.projects.findMany(
      {
        with: {
          usersToProjects: true
        },
      }
    );
  }),

  updateOne: publicProcedure
    .input(z.object({ id: z.number(), title: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(projects)
        .set({ title: input.title })
        .where(eq(projects.id, input.id));
    }),

  deleteOne: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(projects).where(eq(projects.id, input.id));
    }),

  deleteAll: publicProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return ctx.db.delete(projects);
  }),
});