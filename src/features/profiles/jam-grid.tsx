import { JamCard } from '@/components/jam-card';
import type { RouterOutputs } from '@/trpc/react';
import { z } from 'zod';

type Props = {
    jams: RouterOutputs['candidates']['getProjects'];
    name?: string;
};

export function JamGrid({ jams, name }: Props) {
    return (
        <div>
            {jams?.map((j) => (
                <div
                    key={j.projectInstanceId}
                    className="relative"
                >
                    <JamCard
                        {...z
                            .looseObject({})
                            .transform((x) => (!!x ? x : undefined))
                            .parse(j)}
                        imageUrl={j.projectInstance.project.imageUrl ?? 'Never'}
                        title={j.projectInstance.project.title ?? 'Never'}
                        numberOfTeammates={j.projectInstance.teamMembers.length}
                        tags={j.projectInstance.project.projectsToTags.map((t) => t.tag)}
                        startDateTime={j.projectInstance.project.startDateTime}
                        endDateTime={j.projectInstance.project.endDateTime}
                    />
                </div>
            ))}
            {jams?.length === 0 && <p className="text-muted-foreground italic">{name ?? 'This user'} has no jams.</p>}
        </div>
    );
}
