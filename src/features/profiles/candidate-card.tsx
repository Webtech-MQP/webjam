'use client';

import { DashboardCard } from '@/components/dashboard-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BriefcaseIcon, CodeIcon, GithubIcon, LinkedinIcon, MapPinIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CandidateCardProps {
    displayName: string;
    bio?: string;
    location?: string;
    language?: string;
    experience?: string;
    githubUsername?: string;
    linkedinURL?: string;
    imageUrl?: string;
    projectCount?: number;
    onClick?: () => void;
    className?: string;
}

export function CandidateCard({ displayName, bio, location, language, experience, githubUsername, linkedinURL, imageUrl, projectCount = 0, onClick, className }: CandidateCardProps) {
    return (
        <DashboardCard
            onClick={onClick}
            className={cn('group flex h-80 cursor-pointer flex-col items-start overflow-hidden px-0 pb-0', className)}
        >
            <div className="relative -mt-6 mb-0 h-32 w-full rounded-t-lg">
                <Image
                    src={imageUrl ?? 'https://placehold.co/400x128/png'}
                    alt={`${displayName} banner`}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="group-hover:bg-primary flex w-full flex-1 flex-col items-start rounded-b-lg p-4 transition-colors duration-300">
                <div className="mb-3 flex w-full flex-col items-start gap-3">
                    <Avatar className="border-background -mt-12 h-12 w-12 border-4">
                        <AvatarImage src={imageUrl} />
                        <AvatarFallback>
                            {displayName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">{displayName}</h3>
                        {location && (
                            <div className="flex items-center gap-1 text-sm text-white">
                                <MapPinIcon className="h-3 w-3" />
                                <span className="truncate">{location}</span>
                            </div>
                        )}
                    </div>
                </div>

                {bio && <p className="mb-3 line-clamp-2 text-sm text-white">{bio}</p>}

                <div className="mb-3 flex flex-wrap gap-2">
                    {language && (
                        <Badge
                            variant="outline"
                            className="text-xs"
                        >
                            <CodeIcon className="mr-1 h-3 w-3" />
                            {language}
                        </Badge>
                    )}
                    {experience && (
                        <Badge
                            variant="outline"
                            className="text-xs"
                        >
                            <BriefcaseIcon className="mr-1 h-3 w-3" />
                            {experience}
                        </Badge>
                    )}
                    <Badge
                        variant="outline"
                        className="text-xs"
                    >
                        {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                    </Badge>
                </div>

                <div className="mt-auto flex gap-2">
                    {githubUsername && (
                        <Link
                            href={`https://github.com/${githubUsername}`}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="transition-colors"
                        >
                            <GithubIcon className="h-4 w-4" />
                        </Link>
                    )}
                    {linkedinURL && (
                        <Link
                            href={linkedinURL}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="transition-colors"
                        >
                            <LinkedinIcon className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            </div>
        </DashboardCard>
    );
}
