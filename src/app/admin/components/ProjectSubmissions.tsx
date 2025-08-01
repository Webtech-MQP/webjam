'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RouterOutputs } from '@/trpc/react';
import Link from 'next/dist/client/link';

type ProjectSubmission = RouterOutputs['projectSubmission']['getAll'][number];

interface ProjectSubmissionsProps {
    submissions: ProjectSubmission[];
}

export function ProjectSubmissions({ submissions }: ProjectSubmissionsProps) {
    return (
        //TODO: change background color
        <Card className="bg-stone-950 border-b border-gray-700">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Pending Submissions</CardTitle>
                    <Button
                        size="sm"
                        className="rounded-lg border-0 bg-orange-600/10 text-orange-400 hover:bg-orange-500/50 px-3 py-1"
                    >
                        <Link href="/admin/">View All</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {submissions.map((submission) => (
                        <div
                            key={submission.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/40"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-white">{submission.project?.title ?? 'Untitled Project'}</h4>
                                    <span className="bg-orange-200/10 text-orange-400 border-0 text-xs px-2 py-1 rounded-lg flex items-center justify-center">{submission.status}</span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Reviewed by {submission.reviewer?.displayName ?? 'Unknown'} •{submission.submittedOn ? new Date(submission.submittedOn).toLocaleString() : 'Unknown date'}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="rounded-lg border-0 bg-orange-600/10 text-orange-400 hover:bg-orange-500/50 px-3 py-1"
                                >
                                    <Link href={`/admin/submissions/${submission.id}`}>Review</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    className="rounded-lg border-0 bg-green-900 text-green-400 hover:bg-green-800 px-3 py-1"
                                >
                                    <Link href={`/admin/submissions/${submission.id}/approve`}>Approve</Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
