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
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().min(1).max(1000),
        startDate: z.date(),
        endDate: z.date(),
        groupSize: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.insert(projects).values({
        title: input.title,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        groupSize: input.groupSize,
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

  findProjects: publicProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        from: z.date().optional(),
        to: z.date().optional(),
        groupSize: z.number().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const q = await ctx.db.query.projects.findMany({
        where: (projects, { and, gte, lte, eq, like }) => {
          const conditions = [like(projects.title, `%${input.title}%`)];
          if (input.from) {
            conditions.push(gte(projects.startDate, input.from));
          }
          if (input.to) {
            conditions.push(lte(projects.startDate, input.to));
          }
          if (input.groupSize) {
            conditions.push(eq(projects.groupSize, input.groupSize));
          }
          return and(...conditions);
        },
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

      return q.filter((p) => {
        if (!input.tags || input.tags.length === 0) return true;
        const projectTagIds = p.tagsToProjects.map((tp) => tp.tag.id);
        return input.tags.every((tagId) => projectTagIds.includes(tagId));
      });
    }),
});
