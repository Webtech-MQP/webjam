import { sendUserReportedEmail } from '@/lib/mailer';
import { candidateProfiles, candidateReport } from '@/server/db/schemas/profiles';
import { TRPCError } from '@trpc/server';
import { and, eq, gte, lt, sql } from 'drizzle-orm';
import z from 'zod';
import { adminProcedure, createTRPCRouter, protectedProcedure } from '../trpc';

export const reportRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                candidateId: z.cuid2(),
                reason: z.string().min(1).max(500),
                description: z.string().min(1).max(1000),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const candidate = await ctx.db.query.candidateProfiles.findFirst({
                where: (candidateProfiles, { eq }) => eq(candidateProfiles.userId, input.candidateId),
            });

            if (!candidate) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Candidate not found' });
            }

            const report = await ctx.db
                .insert(candidateReport)
                .values({
                    candidateId: input.candidateId,
                    reason: input.reason,
                    additionalDetails: input.description,
                    reporterId: ctx.session.user.id,
                })
                .returning();

            const admins = await ctx.db.query.adminProfiles.findMany({
                with: {
                    user: true,
                },
            });

            const emails = admins.map((admin) => admin.contactEmail).filter((email): email is string => !!email);

            sendUserReportedEmail({
                adminEmail: emails.join(', '),
                reporterName: ctx.session.user.name || 'A user',
                reportedName: candidate.displayName ?? 'Unknown user',
                reason: input.reason,
                description: input.description,
                reportId: report[0]?.id || '',
            });

            return report;
        }),

    getAll: adminProcedure.query(async ({ ctx }) => {
        const reports = await ctx.db.query.candidateReport.findMany({
            with: {
                candidateProfile: true,
                reporter: true,
                actioner: true,
            },
            orderBy: (candidateReport, { desc }) => [desc(candidateReport.createdAt)],
        });

        return reports;
    }),

    getTodayCount: adminProcedure.query(async ({ ctx }) => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        return ctx.db
            .select({ count: sql<number>`count(*)` })
            .from(candidateReport)
            .where(and(gte(candidateReport.createdAt, startOfToday), lt(candidateReport.createdAt, startOfTomorrow)))
            .get();
    }),

    archiveReport: adminProcedure.input(z.object({ id: z.cuid2() })).mutation(async ({ ctx, input }) => {
        const report = await ctx.db.query.candidateReport.findFirst({
            where: (candidateReport, { eq }) => eq(candidateReport.id, input.id),
        });

        if (!report) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' });
        }

        if (report.action) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Report has already been actioned' });
        }

        const updatedReport = await ctx.db.update(candidateReport).set({ action: 'archived', actionedBy: ctx.session.user.id, actionedAt: new Date() }).where(eq(candidateReport.id, input.id)).returning();

        return updatedReport;
    }),

    banReportedUser: adminProcedure.input(z.object({ reportId: z.cuid2() })).mutation(async ({ ctx, input }) => {
        const report = await ctx.db.query.candidateReport.findFirst({
            where: (candidateReport, { eq }) => eq(candidateReport.id, input.reportId),
            with: {
                candidateProfile: true,
            },
        });

        if (!report) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' });
        }

        if (report.action) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Report has already been actioned' });
        }

        const userToBan = report.candidateId;

        if (!userToBan) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Error banning user.' });

        // Here you would implement the logic to ban the user, e.g., updating their status in the users table.
        // This is a placeholder for the actual ban logic.
        try {
            await ctx.db.delete(candidateProfiles).where(eq(candidateProfiles.userId, userToBan)).returning();

            const updatedReport = await ctx.db.update(candidateReport).set({ action: 'banned', actionedBy: ctx.session.user.id, actionedAt: new Date(), bannedUserDisplayName: report.candidateProfile?.displayName }).where(eq(candidateReport.id, input.reportId)).returning();

            return updatedReport;
        } catch {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to ban user' });
        }
    }),
});
