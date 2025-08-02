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
                    key={j.id}
                    className="relative"
                >
                    <JamCard
                        {...z
                            .looseObject({})
                            .transform((x) => (!!x ? x : undefined))
                            .parse(j)}
                        imageUrl={j.imageUrl ?? 'Never'}
                        title={j.title ?? 'Never'}
                        numberOfTeammates={j.projectsToCandidateProfiles.length}
                        tags={j.projectsToTags.map((t) => t.tag)}
                        startDateTime={j.startDateTime}
                        endDateTime={j.endDateTime}
                    />
                </div>
            ))}
            {jams?.length === 0 && <p className="text-muted-foreground italic">{name ?? 'This user'} has no jams.</p>}
        </div>
    );
}
