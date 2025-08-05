import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { candidateProfilesToProjectInstances, projectInstances, projects } from '@/server/db/schemas/projects';
import { TRPCError } from '@trpc/server';
import { and, eq, getTableColumns, gte } from 'drizzle-orm';
import z from 'zod';

export const projectInstanceRouter = createTRPCRouter({
    createJams: publicProcedure.input(z.object({ projectId: z.cuid2(), teams: z.array(z.array(z.string())) })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.query.projects.findFirst({
            where: (projects, { eq }) => eq(projects.id, input.projectId),
            with: {
                projectInstances: {
                    with: {
                        teamMembers: true,
                    },
                },
            },
        });

        if (!project) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }

        if (project.projectInstances.length > 0) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Project already has instances created' });
        }

        return Promise.all(
            input.teams.map(async (team, idx) => {
                const instance = await ctx.db
                    .insert(projectInstances)
                    .values({
                        projectId: input.projectId,
                        teamName: 'Team ' + String.fromCharCode(idx + 65),
                    })
                    .returning({ id: projectInstances.id });

                if (!instance || instance.length < 1) {
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create project instance' });
                }

                return Promise.all(
                    team.map((user) => {
                        return ctx.db.insert(candidateProfilesToProjectInstances).values({
                            projectInstanceId: instance[0]!.id,
                            candidateId: user,
                            visible: true,
                        });
                    })
                );
            })
        );
    }),

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
    getMyActive: protectedProcedure.query(async ({ ctx }) => {
        const instances = await ctx.db
            .select(getTableColumns(projectInstances))
            .from(projectInstances)
            .innerJoin(candidateProfilesToProjectInstances, eq(candidateProfilesToProjectInstances.projectInstanceId, projectInstances.id))
            .innerJoin(projects, eq(projectInstances.projectId, projects.id))
            .where(and(eq(candidateProfilesToProjectInstances.candidateId, ctx.session.user.id), gte(projects.endDateTime, new Date())));

        return instances;
    }),
});
