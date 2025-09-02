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

    const myRatingRaw = api.projectInstances.getMyProjectInstanceRating.useQuery({ projectInstanceId });

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
            {Array.from({ length: 10 }).map((_, index) => (
                    <button
                        key={index}
                        disabled={isAdmin}
                        onClick={() => !isAdmin && rate.mutate({ projectInstanceId, rating: (10 - index) })}
                        className={cn('box-content cursor-pointer w-2.5 flex-0 peer hover:fill-primary peer-hover:fill-primary hover:text-primary peer-hover:text-primary text-muted-foreground pl-1', index % 2 == 0 && 'rotate-y-180 pl-0', myRating >= 10 - index ? 'text-primary fill-primary group-hover:fill-none' : '')}
                    >
                        <StarHalf className="w-5 h-5 pointer-events-none fill-inherit" />
                    </button>
            ))}
            <span className="ml-2 text-sm text-gray-400">
                {`${myRating} / 10`}
            </span>
        </div>
    );
}
