import { sendJamEndEmail, sendJudgedEmail } from '@/lib/mailer';
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { projects, projectsTags, tags } from '@/server/db/schemas/projects';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const projectRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                id: z.cuid2(),
                title: z.string().min(1).max(256),
                subtitle: z.string().min(0).max(256),
                description: z.string().min(0).max(10000),
                requirements: z.string().min(0).max(10000),
                imageUrl: z.string().min(0).max(256),
                starts: z.date(),
                ends: z.date(),
                tags: z.array(z.string().min(1).max(256)).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(projects).values({
                id: input.id,
                title: input.title,
                subtitle: input.subtitle,
                description: input.description,
                instructions: '',
                requirements: input.requirements,
                imageUrl: input.imageUrl,
                status: 'created',
                deadline: new Date(0),
                startDateTime: input.starts,
                endDateTime: input.ends,
                createdBy: ctx.session.user.id,
            });

            // Connect tags to the project
            if (input.tags && input.tags.length > 0) {
                await ctx.db.insert(projectsTags).values(
                    input.tags.map((tagId) => ({
                        projectId: input.id,
                        tagId: tagId,
                    }))
                );
            }
        }),

    getOne: publicProcedure.input(z.object({ id: z.cuid2() })).query(async ({ ctx, input }) => {
        return ctx.db.query.projects.findFirst({
            where: (projects, { eq }) => eq(projects.id, input.id),
            with: {
                projectsToTags: {
                    with: {
                        tag: true,
                    },
                },
                creator: true,
                registrations: {
                    with: {
                        candidate: true,
                    },
                },
                projectInstances: true,
            },
        });
    }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.query.projects.findMany({
            with: {
                projectsToTags: {
                    with: {
                        tag: true,
                    },
                },
                creator: true,
            },
        });
    }),

    updateOne: publicProcedure
        .input(
            z.object({
                id: z.cuid2(),
                title: z.string().min(1).max(1000),
                subtitle: z.string().min(0).max(1000),
                description: z.string().min(0).max(10000),
                requirements: z.string().min(0).max(10000),
                imageUrl: z.string().min(0).max(1000),
                starts: z.date(),
                ends: z.date(),
                tags: z.array(z.string().min(1).max(1000)).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .update(projects)
                .set({
                    title: input.title,
                    subtitle: input.subtitle,
                    description: input.description,
                    instructions: '',
                    requirements: input.requirements,
                    imageUrl: input.imageUrl,
                    deadline: new Date(0),
                    startDateTime: input.starts,
                    endDateTime: input.ends,
                })
                .where(eq(projects.id, input.id));

            // Update tags
            if (input.tags && input.tags.length > 0) {
                await ctx.db.delete(projectsTags).where(eq(projectsTags.projectId, input.id));

                await ctx.db.insert(projectsTags).values(
                    input.tags.map((tagId) => ({
                        projectId: input.id,
                        tagId: tagId,
                    }))
                );
            }
        }),

    deleteOne: protectedProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
        return ctx.db.delete(projects).where(eq(projects.id, input.id));
    }),

    deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        return ctx.db.delete(projects);
    }),

    findProjects: publicProcedure
        .input(
            z.object({
                title: z.string().min(1).max(255),
                from: z.date().optional(),
                to: z.date().optional(),
                groupSize: z.number().optional(),
                tags: z.array(z.string()).optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            const q = await ctx.db.query.projects.findMany({
                where: (projects, { and, gte, lte, like }) => {
                    const conditions = [like(projects.title, `%${input.title}%`)];
                    if (input.from) {
                        conditions.push(gte(projects.startDateTime, input.from));
                    }
                    if (input.to) {
                        conditions.push(lte(projects.startDateTime, input.to));
                    }
                    return and(...conditions);
                },
                with: {
                    projectsToTags: {
                        with: {
                            tag: true,
                        },
                    },
                },
            });

            return q.filter((p) => {
                if (input.groupSize && p.numberOfMembers !== input.groupSize) {
                    return false;
                }
                if (!input.tags || input.tags.length === 0) return true;
                const projectTagIds = p.projectsToTags.map((tp) => tp.tag.id);
                return input.tags.every((tagId) => projectTagIds.includes(tagId));
            });
        }),

    //Tag CRUD
    createTag: protectedProcedure.input(z.object({ name: z.string().min(1).max(256) })).mutation(async ({ ctx, input }) => {
        const inserted = await ctx.db.insert(tags).values({ name: input.name }).returning();
        return inserted[0];
    }),

    getTag: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        return ctx.db.query.tags.findFirst({
            where: (tags, { eq }) => eq(tags.id, input.id),
        });
    }),

    getAllTags: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.query.tags.findMany();
    }),

    updateTag: protectedProcedure.input(z.object({ id: z.string(), name: z.string().min(1).max(256) })).mutation(async ({ ctx, input }) => {
        return ctx.db.update(tags).set({ name: input.name }).where(eq(tags.id, input.id));
    }),

    deleteTag: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
        return ctx.db.delete(tags).where(eq(tags.id, input.id));
    }),

    initializeJamCreation: adminProcedure.input(z.object({ id: z.cuid2() })).query(async ({ input, ctx }) => {
        const project = await ctx.db.query.projects.findFirst({
            where: (projects, { eq }) => eq(projects.id, input.id),
            with: {
                registrations: {
                    with: {
                        answers: {
                            with: {
                                question: true,
                            },
                        },
                        candidate: true,
                    },
                },
                questions: {
                    with: {
                        question: true,
                    },
                },
            },
        });

        if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });

        const registrations = project.registrations;

        if (registrations.length == 0) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'No registrations found for this project',
            });
        } else if (registrations.length < project.numberOfMembers) {
            return { teams: [registrations.map((r) => r.candidate.userId)] };
        }

        const preppedRegistrations = registrations.map((r) => ({
            id: r.candidate.userId,
            skills: r.answers.map((a) => ({
                name: a.question.skill,
                level: a.level,
            })),
            role_preference: r.preferredRole,
            // TODO: Use actual learning goals
            learning_goals: ['React', 'JavaScript'],
            experience_level: 'Intermediate',
        }));

        if (!process.env.MATCHER_URL) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Matcher URL not configured',
            });
        }
        const response = await fetch(process.env.MATCHER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                users: preppedRegistrations,
                jam: {
                    id: project.id,
                    required_skills: project.questions.map((q) => q.question.skill),
                    team_size: project.numberOfMembers,
                },
                weights: {
                    skill_diversity: 1,
                    experience_balance: 1,
                    learning_opportunity: 1,
                    role_preference: 1,
                },
            }),
        });

        if (!response.ok) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to initialize jam creation',
            });
        }

        const body = (await response.json()) as { teams: string[][] };

        return body;
    }),

    updateStatus: adminProcedure.input(z.object({ id: z.cuid2(), status: z.enum(['created', 'judging', 'completed']) })).mutation(async ({ ctx, input }) => {
        try {
            if (input.status === 'judging' || input.status === 'completed') {
                const project = await ctx.db.query.projects.findFirst({
                    where: (projects, { eq }) => eq(projects.id, input.id),
                });
                if (!project) throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
                const projectInstances = await ctx.db.query.projectInstances.findMany({
                    where: (pi, { eq }) => eq(pi.projectId, project.id),
                    with: {
                        teamMembers: {
                            with: {
                                candidateProfile: {
                                    with: {
                                        user: true,
                                    },
                                },
                            },
                        },
                    },
                });
                for (const pi of projectInstances) {
                    for (const member of pi.teamMembers) {
                        if (input.status === 'judging') {
                            sendJamEndEmail({
                                to: member.candidateProfile.user.email || '',
                                name: member.candidateProfile.user.name || '',
                                jamName: project.title,
                                jamUrl: `${process.env.FRONTEND_URL}/dashboard/jams/${pi.id}`,
                            });
                        }
                        if (input.status === 'completed') {
                            sendJudgedEmail({
                                to: member.candidateProfile.user.email || '',
                                name: member.candidateProfile.user.name || '',
                                jamName: project.title,
                                jamUrl: `${process.env.FRONTEND_URL}/dashboard/jams/${pi.id}`,
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        }

        return ctx.db.update(projects).set({ status: input.status }).where(eq(projects.id, input.id));
    }),
});
