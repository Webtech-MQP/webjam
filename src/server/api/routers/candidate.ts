import { z } from "zod";
import { eq } from "drizzle-orm";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { candidateProfiles } from "@/server/db/schemas/users";
import { TRPCError } from "@trpc/server";

export const candidateRouter = createTRPCRouter({
  getOne: publicProcedure
    .input(
      z.union([
        z.object({ id: z.string().cuid2() }),
        z.object({ githubUsername: z.string() }),
      ]),
    )
    .query(async ({ ctx, input }) => {
      if ("id" in input) {
        return ctx.db.query.candidateProfiles.findFirst({
          where: (candidateProfiles, { eq }) =>
            eq(candidateProfiles.userId, input.id),
          with: {
            user: true,
            projects: {
              with: {
                project: true,
              },
            },
          },
        });
      } else {
        // Search by githubUsername - first find user, then get their profile
        const user = await ctx.db.query.users.findFirst({
          where: (users, { eq }) =>
            eq(users.githubUsername, input.githubUsername),
        });

        if (!user) return null;

        return ctx.db.query.candidateProfiles.findFirst({
          where: (candidateProfiles, { eq }) =>
            eq(candidateProfiles.userId, user.id),
          with: {
            user: true,
            projects: {
              with: {
                project: true,
              },
            },
          },
        });
      }
    }),

  updateOne: adminProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        location: z.string().optional(),
        language: z.string().optional(),
        resumeURL: z.string().optional(),
        displayName: z.string().optional(),
        bio: z.string().optional(),
        experience: z.string().optional(),
        githubUsername: z.string().optional(),
        portfolioURL: z.string().optional(),
        linkedinURL: z.string().optional(),
        imageURL: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedData = Object.fromEntries(
        Object.entries(input).filter(
          ([key, value]) => key !== "id" && value !== undefined,
        ),
      );
      return ctx.db
        .update(candidateProfiles)
        .set(updatedData)
        .where(eq(candidateProfiles.userId, input.id));
    }),

  deleteOne: adminProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(candidateProfiles)
        .where(eq(candidateProfiles.userId, input.id));
    }),

  deleteAll: adminProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return ctx.db.delete(candidateProfiles);
  }),

  updateMe: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        displayName: z.string().optional(),
        bio: z.string().optional(),
        experience: z.string().optional(),
        location: z.string().optional(),
        language: z.string().optional(),
        resumeURL: z.string().optional(),
        githubUsername: z.string().optional(),
        portfolioURL: z.string().optional(),
        linkedinURL: z.string().optional(),
        imageURL: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const candidateProfile = await ctx.db.query.candidateProfiles.findFirst({
        where: (candidateProfiles, { eq }) =>
          eq(candidateProfiles.userId, input.id),
      });
      if (
        !candidateProfile ||
        candidateProfile.userId !== ctx.session.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your profile" });
      }
      const updatedData = Object.fromEntries(
        Object.entries(input).filter(
          ([key, value]) => key !== "id" && value !== undefined,
        ),
      );
      return ctx.db
        .update(candidateProfiles)
        .set(updatedData)
        .where(eq(candidateProfiles.userId, input.id));
    }),

  deleteMe: protectedProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      const candidateProfile = await ctx.db.query.candidateProfiles.findFirst({
        where: (candidateProfiles, { eq }) =>
          eq(candidateProfiles.userId, input.id),
      });
      if (
        !candidateProfile ||
        candidateProfile.userId !== ctx.session.user.id
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your profile" });
      }
      return ctx.db
        .delete(candidateProfiles)
        .where(eq(candidateProfiles.userId, input.id));
    }),
});

export default candidateRouter;
