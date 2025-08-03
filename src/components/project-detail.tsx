'use client';

import { api } from '@/trpc/react';
import { Calendar, UserPlus, Users } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import { MessyTag } from './messy-tag';
import { ProjectRegistrationFlow } from './project-registration-flow';
import { Button } from './ui/button';

export interface ProjectDetailProps {
    id: string;
}

export const ProjectDetail = (props: ProjectDetailProps) => {
    const { data: project, isLoading } = api.projects.getOne.useQuery({ id: props.id });

    const [visible, setVisible] = useState(false);
    const [showRegistration, setShowRegistration] = useState(false);
    const [registrationCompleted, setRegistrationCompleted] = useState(false);

    if (!project && !isLoading) notFound();

    if (!project) {
        // TODO: Loading skeleton
        return null;
    }

    return (
        <>
            <div className="flex w-full flex-row flex-nowrap justify-between">
                <div className="flex flex-row flex-nowrap justify-start">
                    {project.projectsToTags.map((tag) => {
                        return (
                            <MessyTag
                                key={tag.tagId}
                                textClassName="text-xs text-white"
                                color="#d37c04"
                            >
                                {tag.tag.name}
                            </MessyTag>
                        );
                    })}
                </div>
            </div>
            <div>
                <h1>{project.title}</h1>
                <p>{project.subtitle}</p>
            </div>
            <div>
                <p className="flex flex-nowrap items-baseline gap-1 text-sm">
                    <Calendar size={'1rem'} /> {project.startDateTime.toLocaleDateString()} --- {project.endDateTime.toLocaleDateString()}
                </p>
                <p className="flex flex-nowrap items-baseline gap-1 text-sm">
                    {/*TODO: People who signed up*/}
                    <Users size={'1rem'} /> {123} people signed up
                </p>
            </div>
            <div className="flex flex-row">
                <div className="flex w-1/2 flex-col gap-4">
                    <p className="text-sm">{project.description}</p>
                    <ul>
                        <p className="text-sm">Requirements:</p>
                        {/* {
                      props.requirements.map((req, index)=>{
                          return (
                              <li
                                  key={req+index}
                                  className="text-sm list-disc list-inside"
                              >{req}</li>
                          )
                      })
                  } */}
                        <li className="list-inside list-disc text-sm">{project.requirements}</li>
                    </ul>
                    <Button
                        asChild
                        onClick={() => setShowRegistration(true)}
                    >
                        <span>
                            Join Project <UserPlus />
                        </span>
                    </Button>
                </div>
                {project.imageUrl ? (
                    <div className="w-1/2 px-20">
                        <Image
                            src={project.imageUrl}
                            alt={'Project Image'}
                            width={1000}
                            height={1000}
                            className="object-cover"
                            style={{ aspectRatio: 1 / 1 }}
                        />
                    </div>
                ) : (
                    <div className="bg-primary"></div>
                )}
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
                    <h2 className="text-2xl font-bold text-white">Registration successful</h2>
                    <p className="text-stone-300 mt-2">Thanks for signing up. We&#39;ll be in touch soon.</p>
                    <Button
                        onClick={() => setShowRegistration(false)}
                        className="mt-4"
                    >
                        Close
                    </Button>
                </div>
            )}
        </>
    );
};
