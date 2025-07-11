import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { admins } from "@/server/db/schemas/users";

export const adminRouter = createTRPCRouter({

  getOne: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.admins.findFirst({
        where: (admins, { eq }) => eq(admins.userId, input.id),
      });
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.admins.findMany({
      with: {
        user: true,
      },
    });
  }),

  updateOne: publicProcedure
    .input(
      z.object({ id: z.string().cuid2(), role: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(admins)
        .set({ role: input.role as "Reg" | "Mod" | "Super" | "idk" })
        .where(eq(admins.userId, input.id));
    }),

  deleteOne: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(admins).where(eq(admins.userId, input.id));
    }),

  deleteAll: publicProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return ctx.db.delete(admins);
  }),
});

export default adminRouter;