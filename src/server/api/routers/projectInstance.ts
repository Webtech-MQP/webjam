import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import z from 'zod';

export const projectInstanceRouter = createTRPCRouter({
    getOne: publicProcedure.input(z.object({ id: z.cuid2() })).query(async ({ ctx, input }) => {
        return ctx.db.query.projectInstances.findFirst({
            where: (projectInstances, { eq }) => eq(projectInstances.id, input.id),
            with: {
                project: {
                    with: {
                        projectsToTags: {
                            with: {
                                tag: true,
                            },
                        },
                        creator: true,
                    },
                },
                teamMembers: {
                    with: {
                        candidateProfile: true,
                    },
                },
            },
        });
    }),
});
