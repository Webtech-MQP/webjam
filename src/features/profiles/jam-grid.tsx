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
                <JamCard
                    {...z
                        .object({})
                        .passthrough()
                        .transform((x) => (!!x ? x : undefined))
                        .parse(j)}
                    key={j.id}
                    imageUrl={j.imageURL ?? 'Never'}
                    title={j.title ?? 'Never'}
                    numberOfTeammates={j.candidateProfilesToProjects.length}
                    tags={j.tags.map((t) => t.tag)}
                />
            ))}
            {jams?.length === 0 && <p className="text-muted-foreground italic">{name ?? 'This user'} has no jams.</p>}
        </div>
    );
}
