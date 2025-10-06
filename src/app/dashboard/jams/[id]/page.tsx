import CreateProjectSubmission from '@/components/create-project-submission';
import { DashboardCard } from '@/components/dashboard-card';
import { GitGraph } from '@/components/git-graph';
import { ProjectInstanceRating } from '@/components/project-instance-rating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserActionsMenu } from '@/components/user-actions-menu';
import { GanttChart } from '@/features/time-tracking/components/gantt-chart';
import { auth } from '@/server/auth';
import { api } from '@/trpc/server';
import { ArrowRight, Clock, ExternalLink, Link, ShieldUser, ShieldX, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { LinkRepoButton } from './_components/link-repo-button';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();

    if (!session?.user) {
        redirect('/');
    }

    const isAdmin = await api.users.isAdmin();

    const { id } = await params;

    const projectInstance = await api.projectInstances.getOne({ id });

    const submissions = await api.projectSubmission.getAllSubmissionsForProjectInstance({ projectInstanceId: id });

    const events = await api.projects.getEvents({ projectId: projectInstance!.projectId });

    if (!projectInstance) return <div>Not found!</div>;

    if (!projectInstance.teamMembers.some((t) => t.candidateId == session.user.id) && !isAdmin) {
        return (
            <div className="gap-4 flex flex-col items-center justify-center h-full w-full text-center text-red-300">
                <ShieldX />
                <p>You are not a member of this Jam.</p>
                <Link
                    className="text-primary hover:underline flex gap-2"
                    href="/dashboard/jams"
                >
                    Search for Jams. <ArrowRight />
                </Link>
            </div>
        );
    }

    let rank = null;
    try {
        rank = await api.projectInstances.getRank({ projectInstanceId: id });
    } catch {
        // Do nothing
    }

    const earliestStartTime = Math.min(...events.map((e) => e.startTime.getTime()));
    const progressBar = (Date.now() - earliestStartTime) / (1000 * 60 * 60 * 24);
    const sections = events.map((event) => ({
        start: (event.startTime.getTime() - earliestStartTime) / (1000 * 60 * 60 * 24),
        end: (event.endTime.getTime() - earliestStartTime) / (1000 * 60 * 60 * 24),
        name: event.title,
        color: event.isHeader ? '#e8871e' : '#6366f1',
        header: event.isHeader,
    }));

    const ghOwner = projectInstance.repoUrl?.split('/')[1];
    const ghRepoName = projectInstance.repoUrl?.split('/')[2];

    return (
        <>
            {isAdmin && (
                <div className="bg-green-900  dark:bg-green-200 w-full rounded text-background p-2 mb-2 flex gap-2">
                    <ShieldUser /> You are viewing this Jam as an admin.
                </div>
            )}
            <div className="flex flex-col gap-2 ">
                <DashboardCard className="bg-card">
                    <h1 className="text-primary">
                        {projectInstance.project.title} {rank && <span className="bg-primary text-white">Placed #{rank}</span>}
                    </h1>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <Badge className="bg-indigo-500">
                                <Users /> {projectInstance.teamMembers.length} members
                            </Badge>
                            <Badge className="bg-indigo-500">
                                <Clock /> {projectInstance.project.deadline?.toLocaleDateString()}
                            </Badge>
                        </div>
                        {rank != null && (
                            <ProjectInstanceRating
                                projectInstanceId={projectInstance.id}
                                isAdmin={isAdmin}
                            />
                        )}
                    </div>
                    <div className="relative flex w-full gap-4">
                        <div className="flex-1">
                            <GanttChart
                                sections={sections}
                                progressBar={progressBar}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex w-full divide-x gap-4">
                        <div className="flex-1">
                            <p className="text-muted-foreground mb-4">Instructions</p>
                            <p>{projectInstance.project.instructions}</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-muted-foreground mb-4">Requirements</p>
                            <ol className="space-y-2 list-inside marker:text-muted-foreground list-decimal">
                                {projectInstance.project.requirements.split('\n').map((requirement, index) => (
                                    <li key={index}>{requirement}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </DashboardCard>
                <Card>
                    <CardHeader>
                        <CardTitle>Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative flex w-full flex-col gap-4">
                            {projectInstance.teamMembers.map((projectCandidate, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <div className="relative aspect-square w-8">
                                        <Avatar>
                                            <AvatarImage
                                                src={projectCandidate.candidateProfile.imageUrl ? projectCandidate.candidateProfile.imageUrl : undefined}
                                                alt={projectCandidate.candidateProfile.displayName}
                                            />
                                            <AvatarFallback>{projectCandidate.candidateProfile.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <p className="font-semibold">{projectCandidate.candidateProfile.displayName ?? projectCandidate.candidateProfile.displayName}</p>
                                    <a
                                        className="text-sm text-muted-foreground"
                                        href={`mailto:${projectCandidate.candidateProfile.publicEmail}`}
                                    >
                                        {projectCandidate.candidateProfile.publicEmail}
                                    </a>
                                    <UserActionsMenu
                                        reportedUserName={projectCandidate.candidateProfile.displayName}
                                        reportedUserId={projectCandidate.candidateProfile.userId}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <div className="flex w-full gap-2 h-fit">
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle>Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                            {projectInstance.project.status !== 'completed' && (
                                <div className="mt-4">
                                    <CreateProjectSubmission
                                        projectInstanceId={projectInstance.id}
                                        submitter={session.user.id}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="flex-1 h-fit">
                        <CardHeader className="items-center flex justify-between">
                            <CardTitle>GitHub</CardTitle>
                            <LinkRepoButton projectInstanceId={projectInstance.id} />
                        </CardHeader>
                        {ghOwner && ghRepoName && (
                            <CardContent>
                                <GitGraph
                                    owner={ghOwner}
                                    repoName={ghRepoName}
                                />
                            </CardContent>
                        )}
                    </Card>
                </div>
            </div>
        </>
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
