import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, adminProcedure, protectedProcedure } from "@/server/api/trpc";
import { candidates, candidateProfiles } from "@/server/db/schemas/users";
import { projects } from "@/server/db/schemas/projects";
import { TRPCError } from "@trpc/server";

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

  updateOne: adminProcedure
    .input(
      z.object({ id: z.string().cuid2(), location: z.string(), language: z.string(), resumeURL: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(candidates)
        .set({ location: input.location, language: input.language, resumeURL: input.resumeURL })
        .where(eq(candidates.userId, input.id));
    }),

  deleteOne: adminProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(candidates).where(eq(candidates.userId, input.id));
    }),

  deleteAll: adminProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return ctx.db.delete(candidates);
  }),

  getProfile: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.candidateProfiles.findFirst({
        where: (profile, { eq }) => eq(profile.candidateId, input.id),
      });
    }),

  getAllProfiles: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.candidateProfiles.findMany();
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        displayName: z.string().optional(),
        bio: z.string().optional(),
        experience: z.string().optional(),
        githubUsername: z.string().optional(),
        portfolioURL: z.string().optional(),
        linkedinURL: z.string().optional(),
        imageURL: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const candidate = await ctx.db.query.candidates.findFirst({
        where: (candidates, { eq }) => eq(candidates.userId, input.id),
      });
      if (!candidate || candidate.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your profile" });
      }
      const updatedData = Object.fromEntries(
        Object.entries(input).filter(
          ([key, value]) => key !== "id" && value !== undefined
        )
      );
      return ctx.db
        .update(candidateProfiles)
        .set(updatedData)
        .where(eq(candidateProfiles.candidateId, input.id));
    }),

  deleteMe: protectedProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      const candidate = await ctx.db.query.candidates.findFirst({
        where: (candidates, { eq }) => eq(candidates.userId, input.id),
      });
      if (!candidate || candidate.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your profile" });
      }
      return ctx.db.delete(candidateProfiles).where(eq(candidateProfiles.candidateId, input.id));
    }),
});

export default candidateRouter;