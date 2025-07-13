import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, adminProcedure, protectedProcedure } from "@/server/api/trpc";
import { recruiterProfiles } from "@/server/db/schemas/users";
import { TRPCError } from "@trpc/server";

export const recruiterRouter = createTRPCRouter({

  getOne: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.recruiterProfiles.findFirst({
        where: (recruiterProfiles, { eq }) => eq(recruiterProfiles.userId, input.id),
        with: {
          user: true,
        },
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.recruiterProfiles.findMany({
      with: {
        user: true,
      },
    });
  }),

  updateOne: adminProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        companyName: z.string().optional(),
        location: z.string().optional(),
        displayName: z.string().optional(),
        bio: z.string().optional(),
        companyWebsite: z.string().optional(),
        linkedinURL: z.string().optional(),
        imageURL: z.string().optional(),
        publicEmail: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedData = Object.fromEntries(
        Object.entries(input).filter(
          ([key, value]) => key !== "id" && value !== undefined,
        ),
      );
      return ctx.db
        .update(recruiterProfiles)
        .set(updatedData)
        .where(eq(recruiterProfiles.userId, input.id));
    }),

  deleteOne: adminProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(recruiterProfiles).where(eq(recruiterProfiles.userId, input.id));
    }),

  deleteAll: adminProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return ctx.db.delete(recruiterProfiles);
  }),

  getProfile: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.recruiterProfiles.findFirst({
        where: (recruiterProfiles, { eq }) => eq(recruiterProfiles.userId, input.id),
        with: {
          user: true,
        },
      });
    }),

  getAllProfiles: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.recruiterProfiles.findMany({
      with: {
        user: true,
      },
    });
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        displayName: z.string().optional(),
        companyName: z.string().optional(),
        location: z.string().optional(),
        bio: z.string().optional(),
        companyWebsite: z.string().optional(),
        linkedinURL: z.string().optional(),
        imageURL: z.string().optional(),
        publicEmail: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const recruiterProfile = await ctx.db.query.recruiterProfiles.findFirst({
        where: (recruiterProfiles, { eq }) => eq(recruiterProfiles.userId, input.id),
      });
      if (!recruiterProfile || recruiterProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your profile" });
      }
      const updatedData = Object.fromEntries(
        Object.entries(input).filter(
          ([key, value]) => key !== "id" && value !== undefined
        )
      );
      return ctx.db
        .update(recruiterProfiles)
        .set(updatedData)
        .where(eq(recruiterProfiles.userId, input.id));
    }),

  deleteMe: protectedProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      const recruiterProfile = await ctx.db.query.recruiterProfiles.findFirst({
        where: (recruiterProfiles, { eq }) => eq(recruiterProfiles.userId, input.id),
      });
      if (!recruiterProfile || recruiterProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your profile" });
      }
      return ctx.db.delete(recruiterProfiles).where(eq(recruiterProfiles.userId, input.id));
    }),
});

export default recruiterRouter;
