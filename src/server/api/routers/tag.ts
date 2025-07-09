import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const tagRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.query.tags.findMany();
    }),
});