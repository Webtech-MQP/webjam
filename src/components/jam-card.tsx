import { cn } from '@/lib/utils';
import type { RouterOutputs } from '@/trpc/react';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { DashboardCard } from './dashboard-card';
import { Badge } from './ui/badge';

type Tag = RouterOutputs['projects']['getAll'][number]['projectsToTags'][number]['tag'];

interface JamCardProps {
    title: string;
    startDateTime: Date;
    endDateTime: Date;
    numberOfTeammates?: number;
    imageUrl?: string | null;
    rating?: number | null;
    numberOfRatings?: number;
    tags?: Tag[];
    onClick?: () => void;
    className?: string;
}

export function JamCard({ title, startDateTime, endDateTime, numberOfTeammates, imageUrl, rating, numberOfRatings, tags, onClick, className }: JamCardProps) {
    return (
        <DashboardCard
            onClick={onClick}
            className={cn('group flex h-96 cursor-pointer flex-col items-start overflow-hidden px-0 pb-0', className)}
        >
            <div className="relative -mt-6 mb-0 w-full flex-1 rounded-t-lg">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={`${title} image`}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-primary flex-1 rounded-t-lg" />
                )}
            </div>
            <div className="group-hover:bg-primary flex w-full flex-0 flex-col items-start rounded-b-lg p-3 transition-colors duration-300">
                <div className="flex w-full items-center justify-between">
                    <h3 className="mb-2">{title}</h3>
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star className="inline h-4 w-4" />
                            {rating} {numberOfRatings ? `(${numberOfRatings})` : ''}
                        </div>
                    )}
                </div>
                {startDateTime && endDateTime && (
                    <p className="text-sm">
                        {format(startDateTime, 'MMM dd, yyyy')} - {endDateTime ? format(endDateTime, 'MMM dd, yyyy') : 'Present'} • {numberOfTeammates} members
                    </p>
                )}
                {tags && tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Badge
                                key={tag.id}
                                className="transition group-hover:border-white"
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}
