import { env } from '@/env';
import { adminProcedure, createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { projectRegistrationAnswer, projectRegistrationQuestions, projectRegistrations, projectsToRegistrationQuestions } from '@/server/db/schemas/project-registration';
import { GoogleGenAI, Type } from '@google/genai';
import { createId } from '@paralleldrive/cuid2';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z, ZodError } from 'zod';

const questionTypeEnum = z.enum(['text', 'select']);

const ai = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : null;

export const projectRegistrationRouter = createTRPCRouter({
    createQuestion: adminProcedure
        .input(
            z.object({
                question: z.string().min(1),
                type: questionTypeEnum,
                options: z.string().optional(),
                required: z.boolean().default(true),
                skill: z.string(),
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
                skill: input.skill,
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
                preferredRole: z.enum(['frontend', 'backend', 'fullstack']),
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
                preferredRole: input.preferredRole,
            });

            const questions = await ctx.db.query.projectRegistrationQuestions.findMany({
                where: (projectRegistrationQuestions, { inArray }) =>
                    inArray(
                        projectRegistrationQuestions.id,
                        input.answers.map((a) => a.questionId)
                    ),
            });

            const answers = input.answers.map((answer) => ({
                skill: questions.find((q) => q.id === answer.questionId)?.skill || 'unknown',
                questionId: answer.questionId,
                question: questions.find((q) => q.id === answer.questionId)?.question || '',
                answer: answer.answer,
            }));

            if (!ai) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'AI service is not configured' });
            }

            const prompt = `You are a recruiter evaluating the skills of a candidate. Below, in JSON format, the candidate has responded to a list of questions related to a project registration. Your task is to analyze the answers and score the candidates answer related to the skill on a scale of 1 to 10.
                  ANSWERS:
                  ${JSON.stringify(answers, null, 2)}`;

            const chat = ai.chats.create({
                model: 'gemini-2.0-flash-001',
                config: {
                    systemInstruction: prompt,
                    thinkingConfig: {
                        thinkingBudget: 0,
                    },
                    responseMimeType: 'application/json',
                    responseJsonSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                questionId: { type: Type.STRING, enum: input.answers.map((a) => a.questionId) },
                                score: { type: Type.NUMBER, minimum: 1, maximum: 10 },
                            },
                            required: ['questionId', 'score'],
                        },
                    },
                },
            });

            let response = await chat.sendMessage({
                message: JSON.stringify({ answers }),
            });

            while (true) {
                console.log(response.text);

                if (!response.text) {
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'No response from AI' });
                }

                try {
                    const jsonResponse = JSON.parse(response.text) as unknown;

                    const parsedResponse = z
                        .array(
                            z.strictObject({
                                questionId: z.enum(input.answers.map((a) => a.questionId)),
                                score: z.number().min(1).max(10),
                            })
                        )
                        .superRefine((a, ctx) => {
                            if (a.map((a) => a.questionId).length != new Set(a.map((a) => a.questionId)).size) {
                                ctx.addIssue({ message: 'No duplicates allowed' });
                            }

                            if (!answers.map((x) => x.questionId).every((x) => a.map((y) => y.questionId).includes(x))) {
                                ctx.addIssue({ message: 'All questions must be answered' });
                            }
                        })
                        .parse(jsonResponse);

                    const answerScores = parsedResponse.map((answer) => ({
                        registrationId,
                        questionId: answer.questionId,
                        answer: input.answers.find((a) => a.questionId === answer.questionId)?.answer || '',
                        level: answer.score,
                    }));

                    console.log('YOU SHOULD HAVE STOPPD');

                    return ctx.db.insert(projectRegistrationAnswer).values(answerScores).returning();
                } catch (e) {
                    console.error(e);
                    if (e instanceof ZodError) {
                        response = await chat.sendMessage({
                            message: `This was formatted incorrectly. See the Zod Error for context: ${e.issues.map((i) => i.path.join('.') + ':' + i.code).join(',')}. Try again with the same input. Do not include any additional explanation.`,
                        });
                        continue;
                    } else {
                        response = await chat.sendMessage({
                            message: `Your response was not valid JSON. Try again with the same input. Do not include any additional explanation.`,
                        });
                        continue;
                    }
                }
            }
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
