import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { admins, adminProfiles } from "@/server/db/schemas/users";
import { adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({

  getOne: adminProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.admins.findFirst({
        where: (admins, { eq }) => eq(admins.userId, input.id),
      });
    }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.admins.findMany({
      with: {
        user: true,
      },
    });
  }),

  updateOne: adminProcedure
    .input(
      z.object({ id: z.string().cuid2(), role: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(admins)
        .set({ role: input.role as "Reg" | "Mod" | "Super" | "idk" })
        .where(eq(admins.userId, input.id));
    }),

  deleteOne: adminProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(admins).where(eq(admins.userId, input.id));
    }),

  deleteAll: adminProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return ctx.db.delete(admins);
  }),

  getProfile: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.adminProfiles.findFirst({
        where: (profile, { eq }) => eq(profile.adminId, input.id),
      });
    }),

  getAllProfiles: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.adminProfiles.findMany();
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid2(),
        displayName: z.string().optional(),
        bio: z.string().optional(),
        imageURL: z.string().optional(),
        contactEmail: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const admin = await ctx.db.query.admins.findFirst({
        where: (admins, { eq }) => eq(admins.userId, input.id),
      });
      if (!admin || admin.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not your profile" });
      }
      const updatedData = Object.fromEntries(
        Object.entries(input).filter(
          ([key, value]) => key !== "id" && value !== undefined
        )
      );
      return ctx.db
        .update(adminProfiles)
        .set(updatedData)
        .where(eq(adminProfiles.adminId, input.id));
    }),

  deleteProfile: adminProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(adminProfiles).where(eq(adminProfiles.adminId, input.id));
    }),
});

export default adminRouter;