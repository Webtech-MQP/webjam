'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag } from 'lucide-react';
import type { AdminProfile } from './ProjectSubmissions';

export interface CandidateProfile {
    userId: string;
    displayName: string;
    location: string | null;
    language: string | null;
    resumeURL: string | null;
    bio: string | null;
    experience: string | null;
    portfolioURL: string | null;
    linkedinURL: string | null;
    imageURL: string | null;
}

export interface User {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: 'candidate' | 'admin' | 'recruiter' | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export interface Report {
    id: string;
    candidateId: string | null;
    reporterId: string | null;
    reason: string;
    additionalDetails: string;
    createdAt: Date | null;
    action: 'banned' | 'archived' | null;
    actionedAt: Date | null;
    actionedBy: string | null;
    bannedUserDisplayName: string;
    candidateProfile: CandidateProfile | null;
    reporter: User | null;
    actioner: AdminProfile | null;
}

interface ReportsListProps {
    reports: Report[];
}

export function ReportsList({ reports }: ReportsListProps) {
    const previewReports = reports.slice(0, 3);
    return (
        <Card className="bg-stone-950 border-b border-gray-700">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Priority Alerts</CardTitle>
                    <span className="bg-orange-500/20 text-orange-400 border-0 text-xs px-2 py-1 rounded-lg flex items-center justify-center">{reports.length} Active Reports</span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {previewReports.map((report) => (
                        <div
                            key={report.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-orange-900/20"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-400/10">
                                        <Flag className="w-4 h-4 text-orange-400" />
                                    </span>
                                    <span className="font-medium text-white">{report.reason}</span>
                                </div>
                                <p className="text-sm text-gray-300">
                                    Reported by {report.reporter!.name} • Against: {report.bannedUserDisplayName}
                                </p>
                                <p className="text-xs text-gray-400">{new Date(report.createdAt!).toLocaleDateString()}</p>
                            </div>
                            <Button
                                size="sm"
                                className="rounded-lg border-0 bg-orange-600/10 text-orange-400 hover:bg-orange-500/50 px-3 py-1"
                                onClick={() => (window.location.href = `/admin/reports#${report.id}`)}
                            >
                                Investigate
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
