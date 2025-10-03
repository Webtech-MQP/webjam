'use client';

import { DashboardCard } from '@/components/dashboard-card';
import type { RouterOutputs } from '@/trpc/react';
import ProjectSubmission from './ProjectSubmission';

type ProjectSubmissionT = RouterOutputs['projectSubmission']['getAll'][number] & { submissionNumber?: number };

interface ProjectSubmissionsProps {
    submissions: ProjectSubmissionT[];
}

export function ProjectSubmissions({ submissions }: ProjectSubmissionsProps) {
    const submissionsWithActionable = submissions.map((submission) => ({
        ...submission,
        actionable: submission.projectInstance.project.status === 'judging',
    }));

    return (
        <DashboardCard>
            <h1 className="text-white">Submissions</h1>
            <div className="space-y-4">
                {submissionsWithActionable.map((submission) => (
                    <ProjectSubmission
                        submission={submission}
                        key={submission.id}
                    />
                ))}
            </div>
        </DashboardCard>
    );
}
