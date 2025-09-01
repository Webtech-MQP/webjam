'use client';

import { AwardBadge } from './award-badge';

export interface CandidateAwardSchema {
    id: string;
    userId: string;
    awardId: string;
    projectSubmissionId: string | null;
    earnedAt: Date | null;
    displayOrder: number | null;
    isVisible: boolean | null;
    award: {
        id: string;
        createdAt: Date | null;
        imageURL: string;
        description: string | null;
        title: string;
    };
    projectSubmission?: {
        id: string;
        projectId: string;
        submittedOn: Date | null;
        status: string;
    };
}

interface AwardsSectionProps {
    awards: CandidateAwardSchema[];
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    title?: string;
}

export function AwardsSection({ awards, className = '', size = 'md', title = 'Awards' }: AwardsSectionProps) {
    if (awards.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <h3 className="text-sm font-medium tracking-wide text-gray-400 uppercase">{title}</h3>
            <div className="flex flex-wrap gap-2">
                {awards.map((award) => (
                    <AwardBadge
                        key={award.id}
                        CandidateAward={award}
                        size={size}
                    />
                ))}
            </div>
        </div>
    );
}
