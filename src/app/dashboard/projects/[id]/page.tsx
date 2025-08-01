import { DashboardCard } from '@/components/dashboard-card';
import { Badge } from '@/components/ui/badge';
import { GanttChart } from '@/features/time-tracking/components/gantt-chart';
import { api } from '@/trpc/server';
import { Clock, ExternalLink, Users } from 'lucide-react';
import Image from 'next/image';
// import { CommitChart } from "@/features/github-integration/components/commit-chart";
// import { DeploymentChart } from "@/features/aws-integration/components/deployment-chart";
import CreateProjectSubmission from '@/components/create-project-submission';
import { GitGraph } from '@/components/git-graph';
import { UserActionsMenu } from '@/components/user-actions-menu';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();

    if (!session?.user) {
        redirect('/');
    }

    const { id } = await params;

    const project = await api.projects.getOne({ id });

    const submissions = await api.projectSubmission.getAllSubmissionsForProject({ projectId: id });

    if (!project) return <div>Not found!</div>;

    return (
        <div className="flex flex-col gap-2 p-4">
            <DashboardCard>
                <h1>{project.title}</h1>
                <div className="flex gap-2">
                    <Badge className="bg-indigo-500">
                        <Users /> {project.projectsToCandidateProfiles.length} members
                    </Badge>
                    <Badge className="bg-indigo-500">
                        <Clock /> {project.deadline?.toLocaleDateString()}
                    </Badge>
                </div>
                <div className="relative flex w-full gap-4">
                    <div className="relative h-32 w-32 rounded-lg">
                        <Image
                            src="https://placehold.co/150/png"
                            alt="Project Image"
                            fill
                            objectFit="contain"
                            className="rounded"
                        />
                        <a
                            target="_blank"
                            href="https://example.com"
                            className="group absolute flex h-full w-full items-center bg-black/50 hover:bg-black/70"
                        >
                            <ExternalLink className="group-hover:stroke-primary mx-auto" />
                        </a>
                    </div>
                    <div className="flex-1">
                        <GanttChart
                            sections={[
                                {
                                    name: 'Week 1',
                                    color: '#e8871e',
                                    start: 0,
                                    end: 7,
                                    header: true,
                                },
                                {
                                    name: 'Week 2',
                                    color: '#e8871e',
                                    start: 7,
                                    end: 14,
                                    header: true,
                                },
                                {
                                    name: 'Week 3',
                                    color: '#e8871e',
                                    start: 14,
                                    end: 21,
                                    header: true,
                                },
                                {
                                    name: 'Week 4',
                                    color: '#e8871e',
                                    start: 21,
                                    end: 28,
                                    header: true,
                                },
                                {
                                    name: 'Week 5',
                                    color: '#e8871e',
                                    start: 28,
                                    end: 35,
                                    header: true,
                                },
                                {
                                    name: 'Meet your teammates',
                                    color: '#404040',
                                    start: 0,
                                    end: 6,
                                },
                                { name: 'Code Stuff', color: '#6366f1', start: 4, end: 28 },
                            ]}
                            progressBar={10}
                        />
                    </div>
                </div>
            </DashboardCard>
            <DashboardCard>
                <h6 className="text-sm font-medium text-gray-300">Members</h6>
                <div className="relative flex w-full flex-col gap-4">
                    {project.projectsToCandidateProfiles.map((projectCandidate, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2"
                        >
                            <div className="relative aspect-square w-8">
                                <Image
                                    src={projectCandidate.candidateProfile.imageURL ?? ''}
                                    alt={projectCandidate.candidateProfile.displayName}
                                    fill
                                    objectFit="cover"
                                    className="rounded-full"
                                />
                            </div>
                            <p className="font-semibold">{projectCandidate.candidateProfile.displayName ?? projectCandidate.candidateProfile.displayName}</p>
                            <p className="text-sm text-gray-500">Placeholder</p>
                            <UserActionsMenu
                                reportedUserName={projectCandidate.candidateProfile.displayName}
                                reportedUserId={projectCandidate.candidateProfile.userId}
                            />
                        </div>
                    ))}
                </div>
            </DashboardCard>
            <div className="flex w-full gap-2 h-fit">
                <DashboardCard className="flex-1">
                    <h6 className="text-sm font-medium text-gray-300">Submissions</h6>
                    {submissions.length > 0 ? (
                        <div className="flex flex-col-reverse gap-8">
                            {submissions.map(async (submission, index) => (
                                <div
                                    key={submission.id}
                                    className="flex items-start justify-between flex-col"
                                >
                                    <div className="flex-1 w-full flex items-center justify-between gap-2">
                                        <p>Submission #{index + 1}</p>
                                        <ProjectStatusBadge status={submission.status} />
                                    </div>
                                    <div className="my-2 flex w-full flex-col gap-1">
                                        <p className="text-sm text-gray-500">
                                            Submitted by{' '}
                                            <a
                                                href={`/users/${submission.submittedBy}`}
                                                className="hover:underline"
                                            >
                                                {(await api.users.getOne({ id: submission.submittedBy }))?.name}
                                            </a>{' '}
                                            on {submission.submittedOn?.toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="my-2 flex w-full flex-col gap-1">
                                        {['approved', 'denied'].includes(submission.status ?? '') && (
                                            <p className="text-sm text-gray-500">
                                                Reviewed {submission.reviewedBy ? `by ${(await api.users.getOne({ id: submission.reviewedBy }))?.name}` : ''} on {submission.reviewedOn?.toLocaleDateString()}
                                            </p>
                                        )}
                                        {submission.notes && <p className="text-sm">Notes: {submission.notes}</p>}
                                    </div>
                                    <div className="flex w-full items-center justify-between">
                                        {submission.repositoryURL && (
                                            <a
                                                href={submission.repositoryURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline text-sm"
                                            >
                                                Repository{' '}
                                                <ExternalLink
                                                    className="inline"
                                                    size={16}
                                                />
                                            </a>
                                        )}
                                        {submission.deploymentURL && (
                                            <a
                                                href={submission.deploymentURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline text-sm"
                                            >
                                                Deployment{' '}
                                                <ExternalLink
                                                    className="inline"
                                                    size={16}
                                                />
                                            </a>
                                        )}
                                    </div>
                                    {index > 0 && <hr className="mt-4 border-gray-300 w-full" />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No submissions yet.</p>
                    )}
                    <div className="mt-4">
                        <CreateProjectSubmission
                            projectId={project.id}
                            submitter={session.user.id}
                        />
                    </div>
                </DashboardCard>
                <DashboardCard className="flex-1 h-fit">
                    <h6 className="text-sm font-medium text-gray-300">GitHub</h6>
                    <GitGraph
                        owner={'Webtech-MQP'}
                        repoName={'prototype-3'}
                    />
                </DashboardCard>
            </div>
        </div>
    );
}

const ProjectStatusBadge = ({ status }: { status: string | null }) => {
    const statusColors: Record<string, string> = {
        submitted: 'bg-gray-500',
        'under-review': 'bg-blue-500',
        approved: 'bg-green-500',
        denied: 'bg-red-500',
    };

    if (!status || !statusColors[status]) {
        return null;
    }

    return <Badge className={statusColors[status] || 'bg-gray-500'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
};
