import { z } from "zod";
import { and, eq } from "drizzle-orm";
import {
  createTRPCRouter,
  publicProcedure,
  adminProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { candidateProfiles, users } from "@/server/db/schemas/users";
import { TRPCError } from "@trpc/server";
import { candidateProfilesToProjects } from "@/server/db/schemas/projects";

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
            user: {
              columns: {
                githubUsername: true,
              },
            },
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
      z
        .object({
          id: z.string().cuid2(),
          location: z.string(),
          language: z.string(),
          resumeURL: z.string(),
          displayName: z.string(),
          bio: z.string(),
          experience: z.string(),
          githubUsername: z.string(),
          portfolioURL: z.string(),
          linkedinURL: z.string(),
          imageURL: z.string(),
        })
        .partial()
        .required({ id: true }),
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
      z
        .object({
          displayName: z.string(),
          bio: z.string(),
          experience: z.string(),
          location: z.string(),
          language: z.string(),
          resumeURL: z.string(),
          githubUsername: z.string(),
          portfolioURL: z.string(),
          linkedinURL: z.string().url().startsWith("https://linkedin.com/in/", {
            message: "Must be a valid LinkedIn URL",
          }),
          imageURL: z.string().url(),
        })
        .partial(),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(candidateProfiles)
        .set(input)
        .where(eq(candidateProfiles.userId, ctx.session.user.id));
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

  getProjects: publicProcedure
    .input(z.object({ userId: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      const candidateProfile = await ctx.db.query.candidateProfiles.findFirst({
        where: (candidateProfiles, { eq }) =>
          eq(candidateProfiles.userId, input.userId),
        with: {
          projects: {
            with: {
              project: {
                with: {
                  tags: {
                    with: { tag: true },
                  },
                  candidateProfilesToProjects: true,
                },
              },
            },
          },
        },
      });
      if (!candidateProfile) return null;
      return candidateProfile.projects
        .filter((p) => p.visible)
        .map((p) => p.project);
    }),

  changeProjectVisibility: protectedProcedure
    .input(z.object({ projectId: z.string(), visible: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const q = await ctx.db
        .update(candidateProfilesToProjects)
        .set({ visible: input.visible })
        .where(
          and(
            eq(candidateProfilesToProjects.projectId, input.projectId),
            eq(candidateProfilesToProjects.candidateId, ctx.session.user.id),
          ),
        )
        .returning({
          newVisible: candidateProfilesToProjects.visible,
          projectId: candidateProfilesToProjects.projectId,
        });

      if (!q) throw new TRPCError({ code: "NOT_FOUND" });

      if (q.length !== 1)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const newRow = q[0];

      return newRow!;
    }),
});

export default candidateRouter;
