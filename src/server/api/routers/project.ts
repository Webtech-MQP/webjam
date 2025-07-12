import { z } from "zod";
import { eq, gte, lte } from "drizzle-orm";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { projects } from "@/server/db/schema";
import { start } from "repl";

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
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        groupSize: z.number().optional(),
        tags: z.set(z.string()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.projects
        .findMany({
          where: (projects, { and, gte, lte, eq, like }) => {
            const conditions = [like(projects.title, `%${input.title}%`)];
            if (input.startDate) {
              conditions.push(gte(projects.startDate, input.startDate));
            }
            if (input.endDate) {
              conditions.push(lte(projects.endDate, input.endDate));
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
        })
        .then((projects) => {
          if (input.tags && input.tags.size > 0) {
            // Only return projects that have all selected tags
            return projects.filter((project) => {
              const projectTagIds = new Set(
                project.tagsToProjects?.map((t) => t.tag.id) ?? [],
              );
              return Array.from(input.tags!).every((tagId) =>
                projectTagIds.has(tagId),
              );
            });
          }
          return projects;
        });
    }),
});
