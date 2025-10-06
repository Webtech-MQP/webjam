'use client';

import { Badge } from '@/components/ui/badge';
import { api } from '@/trpc/react';
import { Calendar, UserPlus, Users, X } from 'lucide-react';
import Image from 'next/image';
import { notFound, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ProjectRegistrationFlow } from './project-registration-flow';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export interface ProjectDetailProps {
    id: string;
}

export const ProjectDetail = (props: ProjectDetailProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const { data: project, isLoading } = api.projects.getOne.useQuery({ id: props.id });

    const [showRegistration, setShowRegistration] = useState(false);
    const [registrationCompleted, setRegistrationCompleted] = useState(false);

    const haveIRegistered = api.projectRegistration.haveIRegistered.useQuery(
        { projectId: props.id },
        {
            enabled: !!props.id,
        }
    );

    if (!project && !isLoading) notFound();

    if (!project) {
        return null;
    }

    const canRegister = project?.projectInstances.length == 0 && !haveIRegistered.data;

    return (
        <Card className="relative h-full overflow-hidden">
            <Button
                className="absolute top-2 right-2 z-100"
                variant="secondary"
                size="icon"
                onClick={() => {
                    router.push(pathname);
                }}
            >
                <X />
            </Button>
            <div className="h-full flex flex-col gap-2">
                {project.imageUrl && (
                    <div className="relative w-full h-32 -mt-[24px]">
                        <Image
                            src={project.imageUrl}
                            alt={'Project Image'}
                            fill
                            className="object-cover"
                            style={{ aspectRatio: 1 / 1 }}
                        />
                    </div>
                )}
                <CardContent className="flex flex-col flex-1 overflow-auto">
                    <div>
                        <h1>{project.title}</h1>
                        <p>{project.subtitle}</p>
                    </div>
                    <div className="flex w-full flex-row flex-nowrap justify-between my-4">
                        <div className="flex flex-row gap-2 flex-nowrap justify-start">
                            {project.projectsToTags.map((tag) => {
                                return <Badge key={tag.tagId}>{tag.tag.name}</Badge>;
                            })}
                        </div>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <Badge className="bg-indigo-500">
                            <Calendar size={'1rem'} /> {project.startDateTime.toLocaleDateString()} - {project.endDateTime.toLocaleDateString()}
                        </Badge>
                        <Badge className="bg-indigo-500">
                            <Users size={'1rem'} />
                            {project.registrations.length} {project.registrations.length === 1 ? 'user' : 'users'} signed up
                        </Badge>
                    </div>
                    <div className="flex flex-row">
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Description</p>
                                <p className="text-sm">{project.description}</p>
                            </div>
                            <ul>
                                <p className="text-sm text-muted-foreground">Requirements</p>
                                <li className="list-inside list-disc text-sm">{project.requirements}</li>
                            </ul>
                            <Button
                                onClick={() => setShowRegistration(true)}
                                disabled={!canRegister}
                            >
                                {canRegister ? (
                                    <span className="flex gap-2">
                                        Join Project <UserPlus />
                                    </span>
                                ) : haveIRegistered ? (
                                    'Already Registered'
                                ) : (
                                    'Not Accepting Registrations'
                                )}
                            </Button>
                        </div>
                    </div>

                    {showRegistration && (
                        <ProjectRegistrationFlow
                            projectId={props.id}
                            open={showRegistration}
                            onClose={(wasSuccessful: boolean) => {
                                setShowRegistration(false);
                                if (wasSuccessful) {
                                    setRegistrationCompleted(true);
                                }
                            }}
                        />
                    )}

                    {registrationCompleted && !showRegistration && (
                        <div className="w-full text-center p-8">
                            <h2 className="text-2xl font-bold text-foreground">Registration successful</h2>
                            <p className="text-stone-300 mt-2">Thanks for signing up. We&#39;ll be in touch soon.</p>
                            <Button
                                onClick={() => setShowRegistration(false)}
                                className="mt-4"
                            >
                                Close
                            </Button>
                        </div>
                    )}
                </CardContent>
            </div>
        </Card>
    );
};
