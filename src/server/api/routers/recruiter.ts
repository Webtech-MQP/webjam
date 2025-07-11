import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, adminProcedure, protectedProcedure } from "@/server/api/trpc";
import { recruiters, recruiterProfiles } from "@/server/db/schemas/users";
import { TRPCError } from "@trpc/server";

export const recruiterRouter = createTRPCRouter({

  getOne: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.recruiters.findFirst({
        where: (recruiters, { eq }) => eq(recruiters.userId, input.id),
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.recruiters.findMany({
      with: {
        user: true,
      },
    });
  }),

  updateOne: adminProcedure
    .input(
      z.object({ id: z.string().cuid2(), companyName: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(recruiters)
        .set({ companyName: input.companyName })
        .where(eq(recruiters.userId, input.id));
    }),

  deleteOne: adminProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(recruiters).where(eq(recruiters.userId, input.id));
    }),

  deleteAll: adminProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return ctx.db.delete(recruiters);
  }),

  getProfile: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.recruiterProfiles.findFirst({
        where: (profile, { eq }) => eq(profile.recruiterId, input.id),
      });
    }),

  getAllProfiles: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.recruiterProfiles.findMany();
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        displayName: z.string(),
        companyName: z.string(),
        bio: z.string(),
        companyWebsite: z.string(),
        linkedinURL: z.string(),
        image: z.string(),
        publicEmail: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const recruiter = await ctx.db.query.recruiters.findFirst({
        where: (recruiters, { eq }) => eq(recruiters.userId, input.id),
      });
      if (!recruiter || recruiter.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your profile" });
      }
      return ctx.db
        .update(recruiterProfiles)
        .set({
          displayName: input.displayName,
          companyName: input.companyName,
          bio: input.bio,
          companyWebsite: input.companyWebsite,
          linkedinURL: input.linkedinURL,
          imageURL: input.image,
          publicEmail: input.publicEmail,
        })
        .where(eq(recruiterProfiles.recruiterId, input.id));
    }),

  deleteProfile: protectedProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      const recruiter = await ctx.db.query.recruiters.findFirst({
        where: (recruiters, { eq }) => eq(recruiters.userId, input.id),
      });
      if (!recruiter || recruiter.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your profile" });
      }
      return ctx.db.delete(recruiterProfiles).where(eq(recruiterProfiles.recruiterId, input.id));
    }),
});

export default recruiterRouter;
