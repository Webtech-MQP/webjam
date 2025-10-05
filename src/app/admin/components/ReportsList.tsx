'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RouterOutputs } from '@/trpc/react';
import { Flag } from 'lucide-react';

type Report = RouterOutputs['reports']['getAll'][number];

interface ReportsListProps {
    reports: Report[];
}

export function ReportsList({ reports }: ReportsListProps) {
    const previewReports = reports.slice(0, 3);
    return (
        <Card className="border-b h-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground">Reports</CardTitle>
                    <span className="dark:bg-orange-500/20 text-orange-400 border-0 text-xs px-2 py-1 rounded-lg flex items-center justify-center">{reports.length} Active Reports</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {previewReports.map((report) => (
                        <div
                            key={report.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-primary/5 dark:bg-orange-900/20"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-400/10">
                                        <Flag className="w-4 h-4 text-orange-400" />
                                    </span>
                                    <span className="font-medium">{report.reason}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Reported by {report.reporter!.name} • Against: {report.bannedUserDisplayName}
                                </p>
                                <p className="text-xs text-muted-foreground">{new Date(report.createdAt!).toLocaleDateString()}</p>
                            </div>
                            {/*<Button
                                size="sm"
                                className="rounded-lg border-0 bg-orange-600/10 text-orange-400 hover:bg-orange-500/50 px-3 py-1"
                            >
                                <Link href={`/admin/reports/${report.id}`}>Investigate</Link>
                            </Button>*/}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
