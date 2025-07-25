'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { api, type RouterOutputs } from '@/trpc/react';
import { BookMinus, Info, LoaderCircle, UserRoundX } from 'lucide-react';
import Link from 'next/link';

type Props = {
    report: RouterOutputs['reports']['getAll'][number];
};

export function AdminReportCard({ report }: Props) {
    const utils = api.useUtils();

    const banUser = api.reports.banReportedUser.useMutation({
        onSettled: async () => {
            await utils.reports.getAll.invalidate();
        },
    });
    const archiveReport = api.reports.archiveReport.useMutation({
        onSettled: async () => {
            await utils.reports.getAll.invalidate();
        },
    });

    return (
        <div className="p-4 rounded-md border flex items-center">
            <div className="space-y-2 flex-1">
                <p>
                    <Link
                        target="_blank"
                        className="text-primary hover:underline"
                        href={report.candidateProfile ? '/users/' + report.candidateProfile.userId : '#'}
                    >
                        {report.candidateProfile?.displayName ?? 'A user'}
                    </Link>{' '}
                    was reported on {report.createdAt?.toLocaleString()}
                </p>
                <p className="flex gap-2">
                    <Info className="text-muted-foreground" />
                    {report.reporter?.name ?? 'An admin'} wrote &quot;{report.reason}&quot;
                </p>
                {report.action && (
                    <p className="text-sm text-muted-foreground">
                        On {report.actionedAt!.toLocaleString()}, {report.actioner!.displayName} {report.action === 'banned' ? `banned the reported user.` : 'archived this report'}
                    </p>
                )}
            </div>
            {!report.action && (
                <div className="gap-2 flex">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                disabled={banUser.isPending}
                                onClick={() => {
                                    banUser.mutate({ reportId: report.id });
                                }}
                            >
                                {banUser.isPending ? <LoaderCircle className="animate-spin" /> : <UserRoundX />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete reported user</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="secondary"
                                disabled={archiveReport.isPending}
                                onClick={() => {
                                    archiveReport.mutate({ id: report.id });
                                }}
                            >
                                {archiveReport.isPending ? <LoaderCircle className="animate-spin" /> : <BookMinus />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Archive report</TooltipContent>
                    </Tooltip>
                </div>
            )}
        </div>
    );
}
