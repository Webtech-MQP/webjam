'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { AdminReportCard } from '@/features/profiles/reports/admin-report-card/admin-report-card';
import { api } from '@/trpc/react';

export default function Page() {
    const reports = api.reports.getAll.useQuery();

    const activeReports = reports.data?.filter((report) => !report.action);
    const archivedReports = reports.data?.filter((report) => !!report.action);

    return (
        <div className="h-full w-full">
            <h1>Reports</h1>
            <div className="space-y-4">
                {activeReports?.map((report) => (
                    <AdminReportCard
                        key={report.id}
                        report={report}
                    />
                ))}
                {reports.isPending &&
                    Array.from({ length: 10 }).map((_, index) => (
                        <Skeleton
                            className="h-24 w-full rounded"
                            key={index}
                        />
                    ))}
            </div>
            {archivedReports && archivedReports.length > 0 && (
                <>
                    <div className="mt-8 border-t relative">
                        <p className="italic text-muted-foreground absolute left-1/2 -translate-y-1/2 -translate-x-1/2 bg-background p-2">Actioned Reports</p>
                    </div>
                    <div className="mt-8 space-y-4">
                        {archivedReports?.map((report) => (
                            <AdminReportCard
                                key={report.id}
                                report={report}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
