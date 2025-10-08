import { api } from '@/trpc/server';
import { notFound } from 'next/navigation';
import { CompletionForm } from './_components/completion-form';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const project = await api.projects.adminGetOne({ id });

    const previewedRankings = await api.judging.previewRankings({ projectId: id });

    if (!project) return notFound();

    return (
        <div className="flex flex-col h-full p-2">
            <h1 className="mb-0">
                Complete Project <span className="font-mono bg-primary rounded px-2 w-fit border-1 border-primary/50">{project.title}</span>
            </h1>
            <p className="mb-4 text-muted-foreground">Finalize the judging phase for this project.</p>
            <CompletionForm
                previewedRankings={previewedRankings}
                project={project}
            />
        </div>
    );
}
