import { projectRegistrationAnswer, projectRegistrations } from '@/server/db/schemas/project-registration';
import { GoogleGenAI } from '@google/genai';
import { createId } from '@paralleldrive/cuid2';
import { TRPCError } from '@trpc/server';
import { z, ZodError } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export const registrationRouter = createTRPCRouter({
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

            const prompt = `You are a recruiter evaluating the skills of a candidate. Below, in JSON format, the candidate has responded to a list of questions related to a project registration. Your task is to analyze the answers and score the candidates answer related to the skill on a scale of 1 to 10.

              Your response should be a JSON object with the following structure:
              {
                answers: [{
                  questionId: string,
                  score: number,
                }]
              }

              It MUST be a valid JSON object, and it MUST NOT contain any additional text or explanations.`;

            const chat = ai.chats.create({ model: 'gemini-2.0-flash-001', config: { systemInstruction: prompt, thinkingConfig: { thinkingBudget: 0 } } });

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
                        .strictObject({
                            answers: z
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

                                    if (answers.map((x) => x.questionId).every((x) => a.map((y) => y.questionId).includes(x))) {
                                        ctx.addIssue({ message: 'All questions must be answered' });
                                    }
                                }),
                        })
                        .parse(jsonResponse);

                    const answerScores = parsedResponse.answers.map((answer) => ({
                        registrationId,
                        questionId: answer.questionId,
                        answer: input.answers.find((a) => a.questionId === answer.questionId)?.answer || '',
                        level: answer.score,
                    }));

                    return ctx.db.insert(projectRegistrationAnswer).values(answerScores).returning();
                } catch (e) {
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
});
