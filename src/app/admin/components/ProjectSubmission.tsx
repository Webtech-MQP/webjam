import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RouterOutputs } from '@/trpc/react';
import { api } from '@/trpc/react';
import { ExternalLink, Github, StarHalf } from 'lucide-react';
import Link from 'next/link';

type ProjectSubmission = RouterOutputs['projectSubmission']['getAll'][number] & { actionable: boolean; submissionNumber?: number };

export default function ProjectSubmission({ submission }: { submission: ProjectSubmission }) {
    const utils = api.useUtils();

    const myRatingRaw = api.projectSubmission.getMyRating.useQuery({ submissionId: submission.id });
    const avgRating = api.projectSubmission.getAvgRating.useQuery({ submissionId: submission.id });

    const myRating = myRatingRaw.data ?? 0;

    return (
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
                    Reviewed by {submission.judgements.length} admins •{submission.submittedOn ? new Date(submission.submittedOn).toLocaleString() : 'Unknown date'}
                </p>
            </div>
            <div className="flex items-center gap-2">
                {submission.repositoryURL && (
                    <>
                        <Button
                            size="icon"
                            variant="secondary"
                        >
                            <Link
                                target="_blank"
                                className="flex gap-2 items-center"
                                href={submission.repositoryURL}
                            >
                                <Github />
                            </Link>
                        </Button>
                        {submission.deploymentURL && (
                            <Button
                                size="sm"
                                className="border-0 bg-orange-600/10 text-orange-400 hover:bg-orange-500/50 "
                            >
                                <Link
                                    target="_blank"
                                    className="flex gap-2 items-center"
                                    href={submission.deploymentURL}
                                >
                                    Deployment <ExternalLink />
                                </Link>
                            </Button>
                        )}
                    </>
                )}
            </div>
            {submission.projectInstance.project.status === 'completed' && !!avgRating.data && (
                <div className="group flex flex-row-reverse items-center">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <div
                            key={index}
                            className={cn('box-content w-2.5 flex-0 peer text-muted-foreground pl-1', index % 2 == 0 && 'rotate-y-180 pl-0', avgRating.data >= 10 - index ? 'text-primary fill-primary' : '')}
                        >
                            <StarHalf className={cn('w-5 h-5 fill-inherit')} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
