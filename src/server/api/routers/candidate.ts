import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { candidates } from "@/server/db/schemas/users";
import { projects } from "@/server/db/schemas/projects";

export const candidateRouter = createTRPCRouter({

  getOne: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.candidates.findFirst({
        where: (candidates, { eq }) => eq(candidates.userId, input.id),
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.candidates.findMany({
      with: {
        user: true,
      },
    });
  }),

  updateOne: publicProcedure
    .input(
      z.object({ id: z.string().cuid2(), bio: z.string(), location: z.string(), language: z.string(), experience: z.string(), githubUsername: z.string(), portfolioURL: z.string(), linkedinURL: z.string(), resumeURL: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(candidates)
        .set({ bio: input.bio, location: input.location, language: input.language, experience: input.experience, githubUsername: input.githubUsername, portfolioURL: input.portfolioURL, linkedinURL: input.linkedinURL, resumeURL: input.resumeURL })
        .where(eq(candidates.userId, input.id));
    }),

  deleteOne: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(candidates).where(eq(candidates.userId, input.id));
    }),

  deleteAll: publicProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return ctx.db.delete(candidates);
  }),
});

export default candidateRouter;