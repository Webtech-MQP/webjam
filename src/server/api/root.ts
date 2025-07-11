import { projectRouter } from "@/server/api/routers/project";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { recruiterRouter } from "@/server/api/routers/recruiter";
import { adminRouter } from "@/server/api/routers/admin";
import projsubRouter from "@/server/api/routers/projsub";
import { candidateRouter } from "@/server/api/routers/candidate";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: userRouter,
  candidates: candidateRouter,
  recruiters: recruiterRouter,
  admins: adminRouter,
  projects: projectRouter,
  projsub: projsubRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
