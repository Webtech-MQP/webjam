import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RouterOutputs } from '@/trpc/react';
import { api } from '@/trpc/react';
import { ExternalLink, Github, StarHalf } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type ProjectSubmission = RouterOutputs['projectSubmission']['getAll'][number] & { actionable: boolean; submissionNumber?: number };

export default function ProjectSubmission({ submission }: { submission: ProjectSubmission }) {
    const utils = api.useUtils();

    const myRatingRaw = api.projectSubmission.getMyRating.useQuery({ submissionId: submission.id });
    const avgRating = api.projectSubmission.getAvgRating.useQuery({ submissionId: submission.id });
    const rateSubmission = api.projectSubmission.rateSubmission.useMutation({
        onSettled: async () => {
            void utils.projectSubmission.getMyRating.invalidate({ submissionId: submission.id });
        },
        onMutate: async (newRating) => {
            await utils.projectSubmission.getMyRating.cancel({ submissionId: submission.id });

            utils.projectSubmission.getMyRating.setData({ submissionId: submission.id }, () => newRating.rating);
        },
        onError: ({ message }) => {
            toast.error(`Failed to rate submission: ${message}`);
        },
    });

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
                    Reviewed by {submission.ratings.length} admins •{submission.submittedOn ? new Date(submission.submittedOn).toLocaleString() : 'Unknown date'}
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
                {submission.actionable && (
                    <div className="group flex flex-row-reverse items-center">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    // Handle star rating click
                                    rateSubmission.mutate({ id: submission.id, rating: 10 - index });
                                    console.log(`Rated ${10 - index} stars for submission ${submission.id}`);
                                }}
                                className={cn('box-content cursor-pointer w-2.5 flex-0 peer hover:fill-primary peer-hover:fill-primary hover:text-primary peer-hover:text-primary text-muted-foreground pl-1', index % 2 == 0 && 'rotate-y-180 pl-0', myRating >= 10 - index ? 'text-primary fill-primary group-hover:fill-none' : '')}
                            >
                                <StarHalf className={cn('w-5 h-5 pointer-events-none fill-inherit')} />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {submission.projectInstance.project.status === 'completed' && avgRating.data && (
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
