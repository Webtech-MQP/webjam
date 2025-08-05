import { ProjectSubmissions } from '@/app/admin/components/ProjectSubmissions';
import { DashboardCard } from '@/components/dashboard-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/server';
import { ArrowRight, ClipboardPenLine, Clock, CodeXml, ExternalLink, Gavel, MoveDown, Pencil } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProjectRegistrations } from './_components/project-registrations';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const project = await api.projects.getOne({ id });
    const submissions = await api.projectSubmission.getAllSubmissionsForProject({ projectId: id });

    if (!project) return <div>Not found!</div>;

    const getDaysUntil = (targetDate: Date) => Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="h-full flex flex-col gap-2 p-4">
            <DashboardCard>
                <h1 className="mb-0">{project.title}</h1>
                <p>{project.subtitle}</p>
                <div className="flex gap-2 items-center">
                    {project.projectsToTags.map((pt) => (
                        <Badge key={pt.tag.id}>{pt.tag.name}</Badge>
                    ))}
                </div>
                <div className="flex gap-2 my-3">
                    <Badge className="bg-indigo-500">{project.registrations.length} registrations</Badge>
                    <Badge className="bg-indigo-500">
                        <Clock /> {getDaysUntil(project.startDateTime)} day{getDaysUntil(project.startDateTime) != 1 && 's'} until project starts
                    </Badge>
                    <Button
                        className="ml-auto"
                        variant="outline"
                        size="icon"
                        asChild
                    >
                        <Link href={`/admin/projects/${project.id}/edit`}>
                            <Pencil />
                        </Link>
                    </Button>
                    {project.projectInstances.length == 0 && project.registrations.length > 0 && (
                        <Button asChild>
                            <Link href={`/admin/projects/${project.id}/jamify`}>
                                Create jams <ArrowRight />
                            </Link>
                        </Button>
                    )}
                </div>
                <div className="relative flex w-full gap-8 pt-4">
                    <div className="relative min-w-1/4 h-fill rounded-lg">
                        <Image
                            src="https://placehold.co/150/png"
                            alt="Project Image"
                            fill
                            objectFit="cover"
                            className="rounded"
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2">
                        <ClipboardPenLine className={cn(project.status === 'upcoming' && project.projectInstances.length == 0 && 'animate-pulse text-red-300')} />
                        <MoveDown className="text-stone-500" />
                        <CodeXml className={cn(project.projectInstances.length > 0 && 'animate-pulse text-red-300')} />
                        <MoveDown className="text-stone-500" />
                        <Gavel className={cn(project.status === 'completed' && 'animate-pulse text-red-300')} />
                    </div>
                    <div className="text-muted-foreground hover:text-white transition-colors">{project.description}</div>
                </div>
            </DashboardCard>
            <div className="flex flex-1 gap-2 overflow-y-auto">
                <ProjectRegistrations projectId={id} />
                <DashboardCard className="flex-1">
                    <h1>Active Jams</h1>
                    {project.projectInstances.length == 0 && <p className="text-muted-foregoround">No Jams yet.</p>}
                    {project.projectInstances.map((j) => {
                        return (
                            <div
                                key={j.id}
                                className="flex items-center gap-3"
                            >
                                <Link
                                    className="flex-1 hover:underline hover:text-primary"
                                    target="_blank"
                                    href={`/dashboard/jams/${j.id}`}
                                >
                                    {j.teamName}
                                </Link>
                                {j.repoUrl && (
                                    <Link
                                        target="_blank"
                                        href={j.repoUrl}
                                    >
                                        <ExternalLink className="hover:text-primary cursor-pointer" />
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </DashboardCard>
            </div>
            <ProjectSubmissions submissions={submissions} />
        </div>
    );
}
