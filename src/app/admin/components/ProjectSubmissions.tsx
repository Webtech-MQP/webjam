'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RouterOutputs } from '@/trpc/react';
import ProjectSubmission from './ProjectSubmission';

type ProjectSubmissionT = RouterOutputs['projectSubmission']['getAll'][number];

interface ProjectSubmissionsProps {
    submissions: ProjectSubmissionT[];
}

export function ProjectSubmissions({ submissions }: ProjectSubmissionsProps) {
    return (
        <Card className="bg-stone-950 border-b border-muted">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white">Pending Submissions</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {submissions.map((submission) => (
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
