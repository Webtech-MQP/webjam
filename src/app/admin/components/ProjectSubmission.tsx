import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RouterOutputs } from '@/trpc/react';
import { api } from '@/trpc/react';
import { StarHalf } from 'lucide-react';
import Link from 'next/link';

type ProjectSubmission = RouterOutputs['projectSubmission']['getAll'][number];

export default function ProjectSubmission({ submission }: { submission: ProjectSubmission }) {
    const utils = api.useUtils();

    const myRating = api.projectSubmission.getMyRating.useQuery({ submissionId: submission.id });
    const rateSubmission = api.projectSubmission.rateSubmission.useMutation({
        onSettled: async () => {
            void utils.projectSubmission.getMyRating.invalidate({ submissionId: submission.id });
        },
        onMutate: async (newRating) => {
            await utils.projectSubmission.getMyRating.cancel({ submissionId: submission.id });

            utils.projectSubmission.getMyRating.setData({ submissionId: submission.id }, () => newRating.rating);
        },
    });

    const rating = myRating.data ?? 0;

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
                            className={cn('hover:cursor-pointer w-2.5 flex-0 peer hover:fill-primary peer-hover:fill-primary hover:text-primary peer-hover:text-primary text-muted-foreground ml-1', index % 2 == 0 && 'rotate-y-180 ml-0', rating >= 10 - index ? 'text-primary fill-primary group-hover:fill-none' : '')}
                        >
                            <StarHalf className={cn('w-5 h-5 pointer-events-none fill-inherit')} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
