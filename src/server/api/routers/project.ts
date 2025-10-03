import { env } from '@/env';
import { sendJamEndEmail, sendJudgedEmail } from '@/lib/mailer';
import { createPresignedPost, deleteS3Object, getS3KeyFromUrl, s3Client } from '@/lib/s3';
import { adminProcedure, createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { projectEvent,projectInstanceRankings, projectJudgingCriteria, projects, projectsTags, tags } from '@/server/db/schemas/projects';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
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
                judgingCriteria: z
                    .array(
                        z.object({
                            criterion: z.string().min(1).max(512),
                            weight: z.number().int().min(0).max(100),
                        })
                    )
                    .optional(),
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

            // Add judging criteria
            if (input.judgingCriteria && input.judgingCriteria.length > 0) {
                await ctx.db.insert(projectJudgingCriteria).values(
                    input.judgingCriteria.map((item) => ({
                        projectId: input.id,
                        criterion: item.criterion,
                        weight: item.weight,
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
                judgingCriteria: true,
            },
        });
    }),

    adminGetOne: adminProcedure.input(z.object({ id: z.cuid2() })).query(async ({ ctx, input }) => {
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
                projectInstances: {
                    with: {
                        submissions: {
                            with: {
                                judgements: true,
                                reviewer: true,
                            },
                        },
                        ranking: true,
                    },
                },
                judgingCriteria: true,
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
                judgingCriteria: true,
            },
        });
    }),

    updateOne: adminProcedure
        .input(
            z.object({
                id: z.cuid2(),
                title: z.string().min(1).max(1000),
                subtitle: z.string().min(0).max(1000),
                description: z.string().min(0).max(10000),
                requirements: z.string().min(0).max(10000),
                imageUrl: z.url(),
                starts: z.date(),
                ends: z.date(),
                tags: z.array(z.string().min(1).max(1000)).optional(),
                judgingCriteria: z
                    .array(
                        z.object({
                            criterion: z.string().min(1).max(512),
                            weight: z.number().int().min(0).max(100),
                        })
                    )
                    .optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const currentProject = await ctx.db.query.projects.findFirst({
                where: eq(projects.id, input.id),
            });

            if (input.imageUrl && currentProject?.imageUrl && currentProject.imageUrl !== input.imageUrl) {
                const oldKey = getS3KeyFromUrl(currentProject.imageUrl);
                if (oldKey) await deleteS3Object(oldKey);
            }

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

            // Update judging criteria
            await ctx.db.delete(projectJudgingCriteria).where(eq(projectJudgingCriteria.projectId, input.id));

            if (input.judgingCriteria && input.judgingCriteria.length > 0) {
                await ctx.db.insert(projectJudgingCriteria).values(
                    input.judgingCriteria.map((item) => ({
                        projectId: input.id,
                        criterion: item.criterion,
                        weight: item.weight,
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

    initializeJamCreation: adminProcedure.input(z.object({ id: z.cuid2(), usersPerTeam: z.int() })).query(async ({ input, ctx }) => {
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
            return [registrations.map((r) => r.candidate.userId)];
        }

        const preppedRegistrations = registrations.map((r) => ({
            id_number: r.candidate.userId,
            skill_levels: r.answers.reduce(
                (acc, curr) => ({
                    ...acc,
                    [curr.question.skill]: curr.level ?? 0,
                }),
                {}
            ),
        }));

        const skills = project.questions.map((q) => q.question.skill);

        if (!env.MATCHER_URL) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Matcher URL not configured',
            });
        }
        const response = await fetch(env.MATCHER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                num_teams: Math.max(Math.floor(preppedRegistrations.length / input.usersPerTeam), 1),
                users: preppedRegistrations,
                skills: skills.map((skill) => ({
                    id: skill,
                    threshold: 7,
                })),
            }),
        });

        if (!response.ok) {
            console.error(JSON.stringify(await response.json()));
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to initialize jam creation',
            });
        }

        const body = (await response.json()) as { id_number: string; skill_levels: { id: string; level: number }[] }[][];

        const teams = body.map((team) => team.map((member) => member.id_number));

        return teams;
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

    completeProject: adminProcedure.input(z.object({ projectId: z.cuid2() })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.query.projects.findFirst({
            where: (projects, { eq }) => eq(projects.id, input.projectId),
            with: {
                projectInstances: {
                    with: {
                        submissions: {
                            with: {
                                judgements: true,
                            },
                        },
                    },
                },
                judgingCriteria: true,
            },
        });

        if (!project) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Project not found' });
        }

        if (project.status !== 'judging') {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Project is not in judging status' });
        }

        const submissions = project.projectInstances.flatMap((instance) => instance.submissions);
        const criteria: Record<string, (typeof project.judgingCriteria)[number]> = project.judgingCriteria.reduce(
            (acc, curr) => ({
                ...acc,
                [curr.id]: curr,
            }),
            {}
        );
        const rankedSubmissions = submissions
            .sort((a, b) => b.submittedOn.valueOf() - a.submittedOn.valueOf())
            .filter((submission, index) => submissions.findIndex((s) => s.projectInstanceId == submission.projectInstanceId) === index)
            .map((s) => ({
                ...s,
                jam: project.projectInstances.find((pi) => pi.id === s.projectInstanceId),
                calculatedScore: Object.entries(
                    s.judgements.reduce(
                        (acc, judgement) => ({
                            ...acc,
                            [judgement.criterionId]: {
                                totalScore: (acc[judgement.criterionId]?.totalScore || 0) + judgement.totalScore,
                                count: (acc[judgement.criterionId]?.count || 0) + 1,
                            },
                        }),
                        {} as Record<string, { totalScore: number; count: number }>
                    )
                ).reduce((acc, [key, value]) => acc + (criteria[key]!.weight / 100) * (value.totalScore / value.count), 0),
            }))
            .sort((a, b) => b.calculatedScore - a.calculatedScore);

        const ranks = rankedSubmissions.map((s, index) => ({
            projectInstanceId: s.projectInstanceId,
            rank: index + 1,
            submissionId: s.id,
        }));

        await ctx.db.insert(projectInstanceRankings).values(ranks);

        await ctx.db.update(projects).set({ status: 'completed' }).where(eq(projects.id, input.projectId));

        return;
    }),

    getRankings: publicProcedure.input(z.object({ projectId: z.cuid2() })).query(async ({ ctx, input }) => {
        const instances = (
            await ctx.db.query.projectInstances.findMany({
                columns: {
                    id: true,
                },
                where: (projectInstances, { eq }) => eq(projectInstances.projectId, input.projectId),
            })
        ).map((instance) => instance.id);

        const rankings = await ctx.db.query.projectInstanceRankings.findMany({
            where: (projectInstanceRankings, { inArray }) => inArray(projectInstanceRankings.projectInstanceId, instances),
        });

        return rankings;
    }),

    generateUploadUrl: adminProcedure
        .input(
            z.object({
                fileType: z.string(),
                fileSize: z.number().max(5 * 1024 * 1024), // 5MB limit
                uploadType: z.enum(['profile', 'banner', 'project', 'award']),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const fileExtension = input.fileType.split('/')[1];
            const fileName = `${input.uploadType}/${nanoid()}.${fileExtension}`;
            try {
                const { url, fields } = await createPresignedPost(s3Client, {
                    Bucket: process.env.AWS_S3_BUCKET_NAME!,
                    Key: fileName,
                    Conditions: [['content-length-range', 0, input.fileSize], { 'Content-Type': input.fileType }],
                    Fields: {
                        'Content-Type': input.fileType,
                    },
                    Expires: 600, // 10 minutes
                });
                return {
                    uploadUrl: url,
                    fields,
                    fileName,
                    fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
                };
            } catch (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to generate upload URL',
                });
            }
        }),

    createEvent: protectedProcedure
        .input(
            z.object({
                projectId: z.string(),
                startTime: z.date(),
                endTime: z.date(),
                title: z.string(),
                description: z.string(),
                isHeader: z.boolean().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (input.startTime >= input.endTime) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'End date must be after start date',
                });
            }

            return ctx.db.insert(projectEvent).values({
                projectId: input.projectId,
                startTime: input.startTime,
                endTime: input.endTime,
                title: input.title,
                description: input.description,
                isHeader: input.isHeader,
            });
        }),

    updateEvent: publicProcedure
        .input(
            z.object({
                projectEventId: z.string(),
                startTime: z.date().optional(),
                endTime: z.date().optional(),
                title: z.string().optional(),
                description: z.string().optional(),
                isHeader: z.boolean().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db
                .update(projectEvent)
                .set({
                    startTime: input.startTime,
                    endTime: input.endTime,
                    title: input.title,
                    description: input.description,
                    isHeader: input.isHeader,
                })
                .where(eq(projectEvent.id, input.projectEventId));
        }),

    getEvents: publicProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return ctx.db.query.projectEvent.findMany({
            where: (projectEvent, { eq }) => eq(projectEvent.projectId, input.projectId),
        });
    }),

    deleteEvent: protectedProcedure.input(z.object({ projectEventId: z.string() })).mutation(async ({ ctx, input }) => {
        return ctx.db.delete(projectEvent).where(eq(projectEvent.id, input.projectEventId));
    }),
});
