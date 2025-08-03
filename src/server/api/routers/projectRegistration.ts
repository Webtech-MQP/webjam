import { adminProcedure, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { projectRegistrationAnswer, projectRegistrationQuestions, projectRegistrations, projectsToRegistrationQuestions } from '@/server/db/schemas/project-registration';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const questionTypeEnum = z.enum(['text', 'select']);

export const projectRegistrationRouter = createTRPCRouter({
    createQuestion: adminProcedure
        .input(
            z.object({
                question: z.string().min(1),
                type: questionTypeEnum,
                options: z.string().optional(),
                required: z.boolean().default(true),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(projectRegistrationQuestions).values({
                id: createId(),
                question: input.question,
                type: input.type,
                options: input.options,
                required: input.required,
                createdBy: ctx.session.user.id,
            });
        }),

    updateQuestionsToProject: adminProcedure
        .input(
            z.object({
                projectId: z.string(),
                questionIds: z.array(z.string()),
            })
        )
        .mutation(async ({ ctx, input }) => {
            //delete all existing connections for the project
            await ctx.db.delete(projectsToRegistrationQuestions).where(eq(projectsToRegistrationQuestions.projectId, input.projectId));

            //insert the new set of connections
            if (input.questionIds.length > 0) {
                await ctx.db.insert(projectsToRegistrationQuestions).values(
                    input.questionIds.map((questionId, index) => ({
                        projectId: input.projectId,
                        questionId,
                        order: index,
                    }))
                );
            }

            return { connected: input.questionIds.length };
        }),

    getProjectQuestions: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return ctx.db
            .select({
                id: projectRegistrationQuestions.id,
                question: projectRegistrationQuestions.question,
                type: projectRegistrationQuestions.type,
                options: projectRegistrationQuestions.options,
                required: projectRegistrationQuestions.required,
                order: projectsToRegistrationQuestions.order,
            })
            .from(projectsToRegistrationQuestions)
            .innerJoin(projectRegistrationQuestions, eq(projectsToRegistrationQuestions.questionId, projectRegistrationQuestions.id))
            .where(eq(projectsToRegistrationQuestions.projectId, input.projectId))
            .orderBy(projectsToRegistrationQuestions.order);
    }),

    getAllQuestions: adminProcedure.query(async ({ ctx }) => {
        return ctx.db.select().from(projectRegistrationQuestions);
    }),

    createRegistration: protectedProcedure
        .input(
            z.object({
                projectId: z.string(),
                answers: z.array(
                    z.object({
                        questionId: z.string(),
                        answer: z.string(),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const registrationId = createId();

            await ctx.db.insert(projectRegistrations).values({
                id: registrationId,
                projectId: input.projectId,
                candidateId: ctx.session.user.id,
                submittedAt: new Date(),
                status: 'pending',
            });

            await ctx.db.insert(projectRegistrationAnswer).values(
                input.answers.map((answer) => ({
                    id: createId(),
                    registrationId,
                    questionId: answer.questionId,
                    answer: answer.answer,
                }))
            );

            return ctx.db.select().from(projectRegistrations).where(eq(projectRegistrations.id, registrationId));
        }),

    getProjectRegistrations: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        const registrations = await ctx.db.select().from(projectRegistrations).where(eq(projectRegistrations.projectId, input.projectId));

        const answers = await ctx.db
            .select()
            .from(projectRegistrationAnswer)
            .where(eq(projectRegistrationAnswer.registrationId, registrations[0]?.id ?? ''));

        //combine the data
        return registrations.map((registration) => ({
            ...registration,
            answers: answers.filter((a) => a.registrationId === registration.id),
        }));
    }),

    deleteQuestion: adminProcedure.input(z.object({ questionId: z.string() })).mutation(async ({ ctx, input }) => {
        return ctx.db.delete(projectRegistrationQuestions).where(eq(projectRegistrationQuestions.id, input.questionId));
    }),
});

export default projectRegistrationRouter;
