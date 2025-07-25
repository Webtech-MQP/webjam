import { candidateProfiles, candidateReport } from '@/server/db/schemas/profiles';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import z from 'zod';
import { adminProcedure, createTRPCRouter } from '../trpc';

export const reportRouter = createTRPCRouter({
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
