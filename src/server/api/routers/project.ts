import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { projects, projectsTags, tags } from '@/server/db/schemas/projects';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const projectRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                id: z.string().cuid2(),
                title: z.string().min(1).max(255),
                subtitle: z.string().min(0).max(255),
                description: z.string().min(0).max(255),
                requirements: z.string().min(0).max(255),
                imageURL: z.string().min(0).max(255),
                starts: z.date(),
                ends: z.date(),
                tags: z.array(z.string().min(1).max(256)).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(projects).values({
                id: input.id,
                title: input.title,
                subTitle: input.subtitle,
                description: input.description,
                instructions: '',
                requirements: input.requirements,
                imageURL: input.imageURL,
                status: 'upcoming',
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

    getOne: publicProcedure.input(z.object({ id: z.string().cuid2() })).query(async ({ ctx, input }) => {
        return ctx.db.query.projects.findFirst({
            where: (projects, { eq }) => eq(projects.id, input.id),
            with: {
                candidateProfilesToProjects: {
                    with: {
                        candidateProfile: true,
                    },
                },
                creator: true,
            },
        });
    }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.query.projects.findMany({
            with: {
                candidateProfilesToProjects: {
                    with: {
                        candidateProfile: true,
                    },
                },
                tags: {
                    with: {
                        tag: true,
                    },
                },
                creator: true,
            },
        });
    }),

    updateOne: publicProcedure.input(z.object({ id: z.string().cuid2(), title: z.string().min(1).max(255) })).mutation(async ({ ctx, input }) => {
        return ctx.db.update(projects).set({ title: input.title }).where(eq(projects.id, input.id));
    }),

    deleteOne: protectedProcedure.input(z.object({ id: z.string().cuid2() })).mutation(async ({ ctx, input }) => {
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
                    candidateProfilesToProjects: {
                        with: {
                            candidateProfile: true,
                        },
                    },
                    tags: {
                        with: {
                            tag: true,
                        },
                    },
                },
            });

            return q.filter((p) => {
                if (input.groupSize && p.candidateProfilesToProjects.length !== input.groupSize) {
                    return false;
                }
                if (!input.tags || input.tags.length === 0) return true;
                const projectTagIds = p.tags.map((tp) => tp.tag.id);
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
});
