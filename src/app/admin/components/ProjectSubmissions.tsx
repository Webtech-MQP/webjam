'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RouterOutputs } from '@/trpc/react';
import { api } from '@/trpc/react';
import { StarHalf } from 'lucide-react';
import Link from 'next/dist/client/link';

type ProjectSubmission = RouterOutputs['projectSubmission']['getAll'][number];

interface ProjectSubmissionsProps {
    submissions: ProjectSubmission[];
}

export function ProjectSubmissions({ submissions }: ProjectSubmissionsProps) {
    const rateSubmission = api.projectSubmission.rateSubmission.useMutation();

    return (
        <Card className="bg-stone-950 border-b border-muted">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Pending Submissions</CardTitle>
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
                                    <h4 className="font-medium text-white">{submission.projectInstance.project.title + ' ⋅ ' + submission.projectInstance.teamName}</h4>
                                    <span className="bg-orange-200/10 text-orange-400 border-0 text-xs px-2 py-1 rounded-lg flex items-center justify-center">{submission.status}</span>
                                </div>
                                <p className="text-sm text-gray-400">
                                    Reviewed by {submission.reviewer?.displayName ?? 'Unknown'} •{submission.submittedOn ? new Date(submission.submittedOn).toLocaleString() : 'Unknown date'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {submission.repositoryURL && (
                                    <Button
                                        size="sm"
                                        className="rounded-lg border-0 bg-orange-600/10 text-orange-400 hover:bg-orange-500/50 px-3 py-1"
                                    >
                                        <Link
                                            target="_blank"
                                            href={submission.repositoryURL}
                                        >
                                            Review
                                        </Link>
                                    </Button>
                                )}
                                <div className="group flex flex-row-reverse items-center">
                                    {Array.from({ length: 10 }).map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                // Handle star rating click
                                                rateSubmission.mutate({ id: submission.id, rating: 10 - index });
                                                console.log(`Rated ${10 - index} stars for submission ${submission.id}`);
                                            }}
                                            className={cn('hover:cursor-pointer w-2.5 flex-0 peer hover:text-primary peer-hover:text-primary text-muted-foreground ml-1', index % 2 == 0 && 'rotate-y-180 ml-0')}
                                        >
                                            <StarHalf className={cn('w-5 h-5 pointer-events-none')} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
