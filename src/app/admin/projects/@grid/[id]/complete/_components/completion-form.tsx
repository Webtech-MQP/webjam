'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api, type RouterOutputs } from '@/trpc/react';
import { useForm } from '@tanstack/react-form';
import { Crown, LoaderCircle, MoveDown, MoveUp, StarHalf } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Project = NonNullable<RouterOutputs['projects']['adminGetOne']>;

interface Props {
    project: Project;
}

export function CompletionForm({ project }: Props) {
    const router = useRouter();

    // Submission handler
    const completeProjectMutation = api.projects.completeProject.useMutation({
        onSuccess: () => {
            void router.push('/admin/projects/' + project.id);
        },
    });

    // Submissions ranked by average rating, latest submission per project instance
    const submissions = project.projectInstances.flatMap((instance) => instance.submissions);
    const latestSubmissions = submissions
        .sort((a, b) => b.submittedOn.valueOf() - a.submittedOn.valueOf())
        .filter((submission, index) => submissions.findIndex((s) => s.projectInstanceId == submission.projectInstanceId) === index)
        .map((s) => ({
            ...s,
            jam: project.projectInstances.find((pi) => pi.id === s.projectInstanceId),
            avgRating: s.ratings.reduce((acc, rating) => acc + rating.rating, 0) / Math.max(1, s.ratings.length),
        }))
        .sort((a, b) => b.avgRating - a.avgRating);

    const submissionsMap = latestSubmissions.reduce((acc, submission) => ({ ...acc, [submission.id]: submission }), {} as Record<string, (typeof latestSubmissions)[number]>);

    // Form setup
    const form = useForm({
        defaultValues: {
            rankings: latestSubmissions.map((submission) => submission.id),
        },
        onSubmit: ({ value }) => {
            const projectInstanceRankings = value.rankings.map((s) => submissionsMap[s]!.projectInstanceId);

            completeProjectMutation.mutate({
                projectId: project.id,
                rankings: projectInstanceRankings,
            });
        },
    });

    const [submissionDetailId, register, checkLock, isLocked] = useHoverLock<string>();
    const submissionDetail = latestSubmissions.find((s) => s.id === submissionDetailId);

    // const [hoveredRankingRef, setHoveredRankingRef] = useState<HTMLElement | null>(null);
    // const panelRef = useRef<HTMLDivElement>(null);
    // const hoveredRect = hoveredRankingRef?.getBoundingClientRect();
    // const panelRect = panelRef.current?.getBoundingClientRect();

    // const point1 = !!hoveredRect && `${hoveredRect.left + hoveredRect.width / 2.0},${hoveredRect.top + hoveredRect.height / 2.0}`;
    // const point2 = !!panelRect && `${panelRect.left},${panelRect.top}`;
    // const point3 = !!panelRect && `${panelRect.left},${panelRect.bottom}`;

    return (
        <>
            <form
                className="flex-1 flex flex-col"
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
                }}
            >
                <div className="flex flex-1 gap-0">
                    <div className="w-1/2 max-w-1/2">
                        <form.Field
                            mode="array"
                            name="rankings"
                        >
                            {(field) => (
                                <div>
                                    <h2 className="text-lg font-medium mb-4">Rank Submissions</h2>
                                    <ul className="space-y-2">
                                        {field.state.value.map((submissionId, index) => {
                                            const submission = latestSubmissions.find((s) => s.id === submissionId)!;

                                            return (
                                                <motion.li
                                                    layout
                                                    key={submission.id}
                                                    className="flex items-center justify-stretch gap-4 p-3 pr-0 divide-border rounded cursor-pointer"
                                                    transition={{
                                                        duration: 0.2,
                                                        ease: 'anticipate',
                                                    }}
                                                    // onMouseEnter={(e) => setHoveredRankingRef(e.currentTarget)}
                                                    {...register(submissionId)}
                                                >
                                                    <span>
                                                        {index < field.state.value.length && field.state.value.length > 1 && (
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="border-r-0 rounded-r-none"
                                                                disabled={index === field.state.value.length - 1 || field.state.value.length <= 1}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    field.swapValues(index, index + 1);
                                                                }}
                                                            >
                                                                <MoveDown />
                                                            </Button>
                                                        )}
                                                        {index < field.state.value.length && field.state.value.length > 1 && (
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="rounded-l-none"
                                                                disabled={index === 0 || field.state.value.length <= 1}
                                                                onClick={() => {
                                                                    field.swapValues(index, index - 1);
                                                                }}
                                                            >
                                                                <MoveUp />
                                                            </Button>
                                                        )}
                                                    </span>
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
                                                                className={cn('box-content w-2.5 flex-0 peer text-muted-foreground pl-1', index % 2 == 0 && 'rotate-y-180 pl-0', submission.avgRating >= 10 - index ? 'text-primary fill-primary' : '')}
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
                            )}
                        </form.Field>
                    </div>
                    <div className={cn('border p-4 rounded flex-1 space-y-1')}>
                        {!!submissionDetail && (
                            <>
                                <h1 className="font-mono">{submissionDetail.jam!.teamName}</h1>
                                <p className="italic text-muted-foreground">Reviewed by {submissionDetail.reviewer?.displayName}</p>
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
                            </>
                        )}
                    </div>
                </div>
                <Button
                    type="submit"
                    className="justify-self-end w-full mt-4"
                >
                    Submit {completeProjectMutation.isPending && <LoaderCircle className="animate-spin w-4 h-4" />}
                </Button>
            </form>
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
