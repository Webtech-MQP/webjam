import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { recruiters } from "@/server/db/schemas/users";

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

  updateOne: publicProcedure
    .input(
      z.object({ id: z.string().cuid2(), companyName: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(recruiters)
        .set({ companyName: input.companyName })
        .where(eq(recruiters.userId, input.id));
    }),

  deleteOne: publicProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.delete(recruiters).where(eq(recruiters.userId, input.id));
    }),

  deleteAll: publicProcedure.mutation(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    return ctx.db.delete(recruiters);
  }),
});

export default recruiterRouter;
