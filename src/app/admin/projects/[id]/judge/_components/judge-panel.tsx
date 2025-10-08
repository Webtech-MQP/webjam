'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api, type RouterOutputs } from '@/trpc/react';

import { StarHalf } from 'lucide-react';
import { motion } from 'motion/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

type Project = NonNullable<RouterOutputs['projects']['adminGetOne']>;

interface Props {
    project: Project;
}

export function JudgePanel({ project }: Props) {
    const session = useSession();

    // Submissions ranked by average rating, latest submission per project instance
    const submissions = project.projectInstances.flatMap((instance) => instance.submissions);
    const latestSubmissions = submissions
        .sort((a, b) => b.submittedOn.valueOf() - a.submittedOn.valueOf())
        .filter((submission, index) => submissions.findIndex((s) => s.projectInstanceId == submission.projectInstanceId) === index)
        .map((s) => ({
            ...s,
            jam: project.projectInstances.find((pi) => pi.id === s.projectInstanceId),
            avgRating: s.judgements.filter((j) => j.judgedBy == (session.data?.user.id ?? -1)).reduce((acc, judgement) => acc + judgement.totalScore * (project.judgingCriteria.find((j) => j.id == judgement.criterionId)!.weight / 100), 0),
        }))
        .sort((a, b) => b.avgRating - a.avgRating);

    const rankings = latestSubmissions.map((submission) => submission.id);

    const [submissionDetailId, register, checkLock] = useHoverLock<string>();
    const submissionDetail = latestSubmissions.find((s) => s.id === submissionDetailId);

    return (
        <>
            <div className="flex-1 flex flex-col">
                <div className="flex flex-1 gap-0">
                    <div className="w-1/3 max-w-1/2">
                        <div>
                            <ul className="space-y-2">
                                {rankings.map((submissionId, index) => {
                                    const submission = latestSubmissions.find((s) => s.id === submissionId)!;

                                    return (
                                        <motion.li
                                            layout
                                            key={submission.id}
                                            className="flex items-center justify-stretch gap-4 p-3 pr-0 divide-border rounded cursor-pointer"
                                            // transition={{
                                            //     duration: 0.2,
                                            //     ease: 'anticipate',
                                            // }}
                                            // onMouseEnter={(e) => setHoveredRankingRef(e.currentTarget)}
                                            {...register(submissionId)}
                                        >
                                            <span className="bold text-primary">{index + 1}</span>
                                            <div className="inline relative">
                                                <span>{submission.jam?.teamName}</span>
                                            </div>
                                            <div className="group flex flex-row-reverse items-center">
                                                {Array.from({ length: 10 }).map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className={cn('fill-none box-content w-2.5 flex-0 peer text-muted-foreground pl-1', index % 2 == 0 && 'rotate-y-180 pl-0', submission.avgRating >= 10 - index ? 'text-primary fill-primary' : '')}
                                                    >
                                                        <StarHalf className={cn('w-5 h-5 fill-inherit')} />
                                                    </div>
                                                ))}
                                            </div>
                                            {submissionDetail?.id == submission.id && <span className={cn('border-b flex-1', checkLock(submissionId) && 'border-primary')} />}
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                    <div className={cn('border p-4 rounded flex-1 space-y-1')}>
                        {!!submissionDetail && (
                            <div>
                                <h1 className="font-mono">{submissionDetail.jam!.teamName}</h1>
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
                                <div className="flex flex-col mt-4 gap-2">
                                    <Criteria
                                        submissionId={submissionDetail.id}
                                        criteria={project.judgingCriteria}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    asChild
                    variant="outline"
                    className="justify-self-end w-full mt-4"
                >
                    <Link href={`/admin/projects/${project.id}`}>Back to project</Link>
                </Button>
            </div>
            {/*<svg className="fixed w-screen h-screen top-0 left-0 pointer-events-none">
                <polygon
                    points={`${point1} ${point2} ${point3}`}
                    fill="lightgray"
                    className="z-40 pointer-events-auto"
                />
            </svg>*/}
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

function Criteria({ submissionId, criteria }: { submissionId: string; criteria: Project['judgingCriteria'] }) {
    const utils = api.useUtils();
    const { data: judgements } = api.judging.getMyJudgements.useQuery({ submissionId });

    const updateJudgement = api.judging.judgeSubmission.useMutation({
        onMutate: async (newJudgement) => {
            await utils.judging.getMyJudgements.cancel({ submissionId: newJudgement.submissionId });

            utils.judging.getMyJudgements.setData({ submissionId: newJudgement.submissionId }, (old) => old?.reduce((acc, curr) => (curr.criterionId === newJudgement.criterionId ? [...acc, { ...curr, totalScore: newJudgement.rating }] : [...acc, curr]), [] as typeof old));
        },

        onSettled: async () => {
            await utils.judging.getMyJudgements.invalidate({ submissionId });
        },
    });

    const judgementsMaps = judgements?.reduce((acc, judgement) => ({ ...acc, [judgement.criterionId]: judgement }), {} as Record<string, (typeof judgements)[number]>);

    if (!judgements) return null;

    return (
        <>
            {criteria.map((c) => (
                <div
                    key={c.id}
                    className="flex-1 flex flex-col gap-4 p-4 border rounded bg-muted/20"
                >
                    <p>{c.criterion}</p>
                    <div className="w-fit group flex flex-row-reverse items-center">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    // Handle star rating click
                                    updateJudgement.mutate({ submissionId, criterionId: c.id, rating: 10 - index });
                                    console.log(`Rated ${10 - index} stars for submission ${c.id}`);
                                }}
                                className={cn('fill-none box-content cursor-pointer w-2.5 flex-0 peer hover:fill-primary peer-hover:fill-primary hover:text-primary peer-hover:text-primary text-muted-foreground pl-1', index % 2 == 0 && 'rotate-y-180 pl-0', (judgementsMaps?.[c.id]?.totalScore ?? 0) >= 10 - index ? 'text-primary fill-primary group-hover:fill-none' : '')}
                            >
                                <StarHalf className={cn('w-5 h-5 pointer-events-none fill-inherit')} />
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </>
    );
}
