import { DashboardCard } from '@/components/dashboard-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/server';
import { ArrowRight, ClipboardPenLine, Clock, ClockFading, CodeXml, ExternalLink, Gavel, MoveDown, Pencil, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const project = await api.projects.getOne({ id });

    if (!project) return <div>Not found!</div>;

    return (
        <div className="h-full flex flex-col gap-2 p-4">
            <DashboardCard>
                <h1 className="mb-0">{project.title}</h1>
                <p>{project.subtitle}</p>
                <div className="flex gap-2 my-3">
                    <Badge className="bg-indigo-500">{project.registrations.length} registrations</Badge>
                    <Badge className="bg-indigo-500">
                        <Clock /> TODO: how long until jam starts
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
                    <Button asChild>
                        <Link href={`/admin/projects/${project.id}/jamify`}>
                            Create jams <ArrowRight />
                        </Link>
                    </Button>
                </div>
                <div className="relative flex w-full gap-4">
                    <div className="relative min-w-1/4 h-fill rounded-lg">
                        <Image
                            src="https://placehold.co/150/png"
                            alt="Project Image"
                            fill
                            objectFit="cover"
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
                    <div className="flex flex-col items-center justify-center gap-2">
                        <ClipboardPenLine className={cn(project.status === 'upcoming' && project.projectInstances.length == 0 && 'animate-pulse text-red-300')} />
                        <MoveDown className="text-stone-500" />
                        <ClockFading className={cn(project.status === 'upcoming' && project.projectInstances.length > 0 && 'animate-pulse text-red-300')} />
                        <MoveDown className="text-stone-500" />
                        <CodeXml className={cn(project.status === 'in-progress' && 'animate-pulse text-red-300')} />
                        <MoveDown className="text-stone-500" />
                        <Gavel className={cn(project.status === 'completed' && 'animate-pulse text-red-300')} />
                    </div>
                    <div>{project.description}</div>
                </div>
            </DashboardCard>
            <div className="flex flex-1 gap-2 overflow-y-auto">
                <DashboardCard>
                    <h1>Registered users</h1>
                    <div className="relative flex w-full flex-col gap-4">
                        {project.registrations.map((r, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3"
                            >
                                <div className="relative aspect-square w-8">
                                    <Image
                                        src={r.candidate.imageUrl ?? ''}
                                        alt={r.candidate.displayName}
                                        fill
                                        objectFit="cover"
                                        className="rounded-full"
                                    />
                                </div>
                                <p className="flex-1 font-semibold">{r.candidate.displayName}</p>
                                <Trash className="hover:text-red-300 cursor-pointer" />
                            </div>
                        ))}
                        {project.registrations.length === 0 && <p className="text-muted-foreground">No registrations yet.</p>}
                    </div>
                </DashboardCard>
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
        </div>
    );
}
