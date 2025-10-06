'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Award, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type { CandidateAwardSchema } from './awards-display-section';

interface AwardBadgeProps {
    CandidateAward: CandidateAwardSchema;
    size?: 'sm' | 'md' | 'lg';
}

export function AwardBadge({ CandidateAward, size = 'md' }: AwardBadgeProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className={`${sizeClasses[size]} cursor-pointer overflow-hidden rounded-full border-2 border-gray-700 transition-transform hover:scale-110 hover:border-gray-500`}
                    >
                        <Image
                            src={CandidateAward.award.imageURL}
                            alt={CandidateAward.award.title}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                        />
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-medium">{CandidateAward.award.title}</p>
                </TooltipContent>
            </Tooltip>

            <Dialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            >
                <DialogContent className="max-w-md border-gray-700 bg-stone-950">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-foreground">
                            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-gray-600">
                                <Image
                                    src={CandidateAward.award.imageURL}
                                    alt={CandidateAward.award.title}
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{CandidateAward.award.title}</h3>
                                {CandidateAward.projectSubmission && <p className="text-sm text-gray-400">Earned from project submission</p>}
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {CandidateAward.award.description && <p className="text-sm leading-relaxed text-gray-300">{CandidateAward.award.description}</p>}

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-400">Earned:</span>
                                <span className="text-foreground">{CandidateAward.earnedAt?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>

                            {CandidateAward.projectSubmission && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Award className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-400">Submission Status:</span>
                                    <span className="text-foreground capitalize">{CandidateAward.projectSubmission.status}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
