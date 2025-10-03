import { api } from '@/trpc/server';
import { notFound } from 'next/navigation';
import { JudgePanel } from './_components/judge-panel';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const project = await api.projects.adminGetOne({ id });

    if (!project) return notFound();

    return (
        <div className="flex flex-col h-full p-2">
            <h1 className="mb-0">
                Judge Project <span className="font-mono bg-stone-900 rounded px-2 w-fit border-1 border-primary/50">{project.title}</span>
            </h1>
            <p className="mb-4 text-muted-foreground">Enter scores for this project&apos;s submissions.</p>
            <JudgePanel project={project} />
        </div>
    );
}
