'use client';

import { AwardBadge } from '@/components/awards/award-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api, type RouterOutputs } from '@/trpc/react';
import { Crown, LoaderCircle, StarHalf } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Project = NonNullable<RouterOutputs['projects']['adminGetOne']>;
type PreviewedRankings = NonNullable<RouterOutputs['judging']['previewRankings']>;

interface Props {
    project: Project;
    previewedRankings: PreviewedRankings;
}

export function CompletionForm({ project, previewedRankings }: Props) {
    const router = useRouter();
    const utils = api.useUtils();
    // Submission handler
    const completeProjectMutation = api.projects.completeProject.useMutation({
        onSuccess: () => {
            void router.push('/admin/projects/' + project.id);
        },
    });
    const [awardAssignments, setAwardAssignments] = useState<Record<string, string | null>>({});

    const [submissionDetailId, register, checkLock] = useHoverLock<string>();
    const submissionDetail = submissionDetailId ? previewedRankings[submissionDetailId] : null;
    const submissionDetailAwards = Object.entries(awardAssignments).filter(([awardId, submissionId]) => {
        return submissionId === submissionDetail?.id;
    });

    return (
        <>
            <div className="flex-1 flex flex-col">
                <div className="flex flex-1 gap-0">
                    <div className="w-1/2 max-w-1/2">
                        <div>
                            <h2 className="text-lg font-medium mb-4">Rank Submissions</h2>
                            <ul className="space-y-2">
                                {Object.values(previewedRankings).map((submission, index) => {
                                    return (
                                        <motion.li
                                            layout
                                            key={submission.id}
                                            className="flex items-center justify-stretch gap-4 p-3 pr-0 divide-border rounded cursor-pointer"
                                            transition={{
                                                duration: 0.2,
                                                ease: 'anticipate',
                                            }}
                                            {...register(submission.id)}
                                        >
                                            <span className="bold text-primary">{index + 1}</span>
                                            <div className="inline relative">
                                                <span>{submission.jam?.teamName}</span>
                                                {index == 0 && (
                                                    <div className="absolute p-1 top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary">
                                                        <Crown className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="group flex flex-row-reverse items-center">
                                                {Array.from({ length: 10 }).map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className={cn('box-content w-2.5 flex-0 peer text-muted-foreground pl-1', index % 2 == 0 && 'rotate-y-180 pl-0', submission.calculatedScore >= 10 - index ? 'text-primary fill-primary' : '')}
                                                    >
                                                        <StarHalf className={cn('w-5 h-5 fill-inherit')} />
                                                    </div>
                                                ))}
                                            </div>
                                            {submissionDetail?.id == submission.id && <span className={cn('border-b flex-1', checkLock(submission.id) && 'border-primary')} />}
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                    <div className={cn('border p-4 rounded flex-1 space-y-1')}>
                        {!!submissionDetail && (
                            <>
                                <h1 className="font-mono">{submissionDetail.jam!.teamName}</h1>
                                <p>Reviewed by {submissionDetail.judgements.filter((s, i) => submissionDetail.judgements.findIndex((x) => x.judgedBy === s.judgedBy) == i).length} judges</p>
                                <p className="mt-4 text-xs text-muted-foreground">Notes</p>
                                <p>{submissionDetail.notes}</p>
                                <div className="mt-4 w-full flex gap-2 justify-stretch items-stretch">
                                    {submissionDetail.deploymentURL && (
                                        <Button
                                            className="flex-1"
                                            asChild
                                        >
                                            <Link
                                                target="_blank"
                                                href={submissionDetail.deploymentURL}
                                            >
                                                View Deployment
                                            </Link>
                                        </Button>
                                    )}
                                    {submissionDetail.repositoryURL && (
                                        <Button
                                            className="flex-1"
                                            asChild
                                            variant="secondary"
                                        >
                                            <Link
                                                target="_blank"
                                                href={submissionDetail.repositoryURL}
                                            >
                                                View Repository
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 border-l-2 pl-4 mt-4">
                                    {submissionDetailAwards.map(([awardId, submissionId]) => {
                                        const award = project.awards.find((award) => award.awardId === awardId);

                                        if (!award) {
                                            return null;
                                        }

                                        return (
                                            <AwardBadge
                                                key={awardId}
                                                award={award.award}
                                            />
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center flex-wrap mt-4 p-4 border rounded">
                    {project.awards.map((projectAward) => (
                        <div
                            key={projectAward.awardId}
                            className="relative h-fit w-fit"
                        >
                            <div className="absolute flex items-center justify-center top-0 z-20 right-0 rounded-full w-6 h-6 bg-primary">{awardAssignments[projectAward.awardId] && awardAssignments[projectAward.awardId] === submissionDetailId ? '✓' : awardAssignments[projectAward.awardId] ? '→' : '✗'}</div>
                            <AwardBadge
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!submissionDetailId) {
                                        return;
                                    }

                                    setAwardAssignments((old) => {
                                        if (old[projectAward.awardId] == submissionDetailId) {
                                            return {
                                                ...old,
                                                [projectAward.awardId]: null,
                                            };
                                        }
                                        return {
                                            ...old,
                                            [projectAward.awardId]: submissionDetailId,
                                        };
                                    });
                                }}
                                key={projectAward.award.id}
                                award={projectAward.award}
                            />
                        </div>
                    ))}
                </div>
                <Button
                    type="button"
                    className="justify-self-end w-full mt-4"
                    onClick={() => completeProjectMutation.mutate({ projectId: project.id, awards: awardAssignments })}
                >
                    Confirm {completeProjectMutation.isPending && <LoaderCircle className="animate-spin w-4 h-4" />}
                </Button>
            </div>
        </>
    );
}

const useHoverLock = <T,>() => {
    const [data, setData] = useState<T | null>(null);
    const [locked, setLocked] = useState<string | null>(null);

    const checkLock = (i: T) => {
        return locked === btoa(JSON.stringify(i));
    };

    const register = (i: T) => {
        return {
            onClick: () => {
                setLocked((prev) => (prev === btoa(JSON.stringify(i)) ? null : btoa(JSON.stringify(i))));
                setData(i);
            },
            onMouseEnter: () => {
                if (!!locked) return;
                setData(i);
            },
        };
    };

    return [data, register, checkLock, !!locked] as const;
};
