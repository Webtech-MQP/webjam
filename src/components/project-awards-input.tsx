'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash, X } from 'lucide-react';
import Image from 'next/image';

export interface Award {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
}

interface ProjectAwardsInputProps {
    title?: string;
    awards: Award[];
    projectAwards: string[];
    onAwardToggle: (awardId: string) => void;
    onCreateAward?: () => void;
    onDeleteAward?: (awardId: string) => void;
    allowEdit?: boolean;
    isAdmin?: boolean;
}

export const ProjectAwardsInput = ({ 
    title = 'Project Awards', 
    awards = [], 
    projectAwards = [], 
    onAwardToggle, 
    allowEdit = true,
    onCreateAward,
    onDeleteAward
}: ProjectAwardsInputProps) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{title}</Label>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onCreateAward}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Award
                </Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                {awards.map((award) => {
                    const isAttached = projectAwards.includes(award.id);
                    return (
                        <div
                            key={award.id}
                            className={`flex gap-3 p-3 border rounded-lg transition-colors ${isAttached ? 'bg-primary/10 border-primary' : 'bg-muted/20'}`}
                        >
                            <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-700">
                                <Image
                                    src={award.imageUrl ?? 'https://placehold.co/40x40/png'}
                                    alt={award.title}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-medium truncate">{award.title}</h3>
                                    <div className="flex gap-2">
                                        {allowEdit && (
                                            <Button
                                                type="button"
                                                variant={isAttached ? 'destructive' : 'outline'}
                                                size="sm"
                                                onClick={() => onAwardToggle(award.id)}
                                                className="flex-shrink-0"
                                            >
                                                {isAttached ? <X className="h-4 w-4" /> : 'Attach'}
                                            </Button>
                                        )}
                                        {/*honestly have no idea where to put this it looks terrible here*/}
                                        {onDeleteAward && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDeleteAward(award.id)}
                                                className="flex-shrink-0 text-destructive hover:text-destructive"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{award.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {awards.length === 0 && <div className="text-center text-muted-foreground text-sm py-4">No awards available.</div>}
        </div>
    );
};
