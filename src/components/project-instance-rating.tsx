'use client';

import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { StarHalf } from 'lucide-react';
import { toast } from 'sonner';

type ProjectInstanceRatingProps = {
    projectInstanceId: string;
    isAdmin: boolean;
};

export function ProjectInstanceRating({ projectInstanceId, isAdmin }: ProjectInstanceRatingProps) {
    const utils = api.useUtils();

    const myRatingRaw = isAdmin ? api.projectInstances.getAvgProjectInstanceRating.useQuery({ projectInstanceId }) : api.projectInstances.getMyProjectInstanceRating.useQuery({ projectInstanceId });

    const rate = api.projectInstances.createOrUpdateRating.useMutation({
        onSettled: () => utils.projectInstances.getMyProjectInstanceRating.invalidate({ projectInstanceId }),
        onMutate: async (newRating) => {
            await utils.projectInstances.getMyProjectInstanceRating.cancel({ projectInstanceId });
            utils.projectInstances.getMyProjectInstanceRating.setData({ projectInstanceId }, () => newRating.rating);
        },
        onError: ({ message }) => toast.error(`Failed to rate project: ${message}`),
    });

    const myRating = myRatingRaw.data ?? 0;

    return (
        <div className="group flex flex-row-reverse items-center mt-2">
            <span className="ml-2 w-12 text-sm text-gray-400">{`${myRating} / 10`}</span>
            {Array.from({ length: 10 }).map((_, index) => (
                <button
                    key={index}
                    disabled={isAdmin}
                    onClick={() => !isAdmin && rate.mutate({ projectInstanceId, rating: 10 - index })}
                    className={cn('box-content w-2.5 flex-0', isAdmin ? 'text-muted dark:text-muted-foreground pl-1' : 'cursor-pointer peer hover:text-primary hover:fill-primary peer-hover:fill-primary peer-hover:text-primary text-muted dark:text-muted-foreground pl-1', index % 2 == 0 && 'rotate-y-180 pl-0', myRating >= 10 - index ? cn('text-primary fill-primary', !isAdmin && 'group-hover:fill-none') : '')}
                >
                    <StarHalf className="w-5 h-5 pointer-events-none fill-inherit" />
                </button>
            ))}
        </div>
    );
}
