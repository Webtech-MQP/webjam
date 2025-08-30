'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card className="bg-stone-950 border-b border-muted">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Pending Submissions</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {submissionsWithActionable.map((submission) => (
                        <ProjectSubmission
                            submission={submission}
                            key={submission.id}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
