import { adminProcedure, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { submissionJudgement } from '@/server/db/schemas/projects';
import { TRPCError } from '@trpc/server';
import { sql } from 'drizzle-orm';
import z from 'zod';

export const judgingRouter = createTRPCRouter({
    getMyJudgements: protectedProcedure.input(z.object({ submissionId: z.string() })).query(async ({ input, ctx }) => {
        const judgements = await ctx.db.query.submissionJudgement.findMany({
            where: (sj, { eq, and }) => and(eq(sj.submissionId, input.submissionId), eq(sj.judgedBy, ctx.session.user.id)),
            columns: {
                id: true,
                criterionId: true,
                totalScore: true,
                notes: true,
                judgedBy: true,
                submissionId: true,
                judgedAt: true,
            },
        });

        return judgements;
    }),

    judgeSubmission: adminProcedure.input(z.object({ criterionId: z.cuid2(), submissionId: z.cuid2(), rating: z.number().min(1).max(10) })).mutation(async ({ ctx, input }) => {
        const projectSubmission = await ctx.db.query.projectSubmissions.findFirst({
            where: (s, { eq }) => eq(s.id, input.submissionId),
            with: {
                projectInstance: {
                    with: {
                        project: true,
                    },
                },
            },
        });

        if (!projectSubmission) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
        }

        const p = await ctx.db.query.projects.findFirst({
            where: (projects, { eq }) => eq(projects.id, projectSubmission.projectInstance.project.id),
        });

        if (!p) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Submission not found' });
        }

        if (p.status !== 'judging') {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Can only rate submissions in judgement status' });
        }

        const q = await ctx.db
            .insert(submissionJudgement)
            .values({
                submissionId: input.submissionId,
                criterionId: input.criterionId,
                totalScore: input.rating,
                judgedBy: ctx.session.user.id,
            })
            .onConflictDoUpdate({
                target: [submissionJudgement.submissionId, submissionJudgement.criterionId, submissionJudgement.judgedBy],
                set: {
                    totalScore: input.rating,
                    judgedBy: ctx.session.user.id,
                    judgedAt: sql`(unixepoch())`,
                },
            });

        return q.rows[0];
    }),

    previewRankings: adminProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
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
            }));

        const submissionsMap = rankedSubmissions.reduce((acc, submission) => ({ ...acc, [submission.id]: submission }), {} as Record<string, (typeof rankedSubmissions)[number]>);

        return submissionsMap;
    }),
});
