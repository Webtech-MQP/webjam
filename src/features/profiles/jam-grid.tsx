import { ProjectCard } from '@/components/project-card';
import type { RouterOutputs } from '@/trpc/react';
import Link from 'next/link';
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
                    <Link
                        target="_blank"
                        href={j.projectInstance.ranking?.submission.deploymentURL ?? '#'}
                    >
                        <ProjectCard
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
                    </Link>
                </div>
            ))}
            {jams?.length === 0 && <p className="text-muted dark:text-muted-foreground italic">{name ?? 'This user'} has no jams.</p>}
        </div>
    );
}
