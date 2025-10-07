'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, Calendar, Lock } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type { CandidateAwardSchema } from './awards-display-section';

interface AwardBadgeProps {
    candidateAward?: Partial<CandidateAwardSchema>;
    award?: {
        id: string;
        title: string;
        description: string | null;
        imageUrl: string;
        createdAt: Date | null;
    };
    size?: 'sm' | 'md' | 'lg';
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function AwardBadge({ onClick, candidateAward, award, size = 'md' }: AwardBadgeProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Determine which award data to use
    const awardData = candidateAward?.award || award;
    const isUnassigned = !candidateAward && !!award;

    if (!awardData) {
        return null;
    }

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    const getBorderClass = () => {
        if (isUnassigned) {
            return 'border-gray-500 opacity-60';
        }
        return 'border-gray-700 hover:border-gray-500';
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={(e) => (!!onClick ? onClick(e) : setIsDialogOpen(true))}
                        className={`${sizeClasses[size]} cursor-pointer overflow-hidden rounded-full border-2 ${getBorderClass()} transition-transform hover:scale-110 relative`}
                    >
                        <Image
                            src={awardData.imageUrl ?? 'https://placehold.co/64x64/png'}
                            alt={awardData.title}
                            width={64}
                            height={64}
                            className={`h-full w-full object-cover ${isUnassigned ? 'grayscale' : ''}`}
                        />
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-medium">
                        {awardData.title}
                        {isUnassigned && ' (Not earned)'}
                    </p>
                </TooltipContent>
            </Tooltip>

            <Dialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            >
                <DialogContent className="max-w-md border-gray-700 bg-stone-950">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-foreground">
                            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-gray-600 relative">
                                <Image
                                    src={awardData.imageUrl ?? 'https://placehold.co/48x48/png'}
                                    alt={awardData.title}
                                    width={48}
                                    height={48}
                                    className={`h-full w-full object-cover ${isUnassigned ? 'grayscale' : ''}`}
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{awardData.title}</h3>
                                {candidateAward?.projectSubmission && <p className="text-sm text-gray-400">Earned from project submission</p>}
                                {isUnassigned && <p className="text-sm text-gray-400">Not yet earned</p>}
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {awardData.description && <p className="text-sm leading-relaxed text-gray-300">{awardData.description}</p>}

                        <div className="space-y-2">
                            {candidateAward?.earnedAt && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-400">Earned:</span>
                                    <span className="text-foreground">
                                        {candidateAward.earnedAt.toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            )}
                            {isUnassigned && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-400">Status:</span>
                                    <span className="text-gray-400">Not earned yet</span>
                                </div>
                            )}{' '}
                            {candidateAward?.projectSubmission && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Award className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-400">Submission Status:</span>
                                    <span className="text-foreground capitalize">{candidateAward.projectSubmission.status}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
