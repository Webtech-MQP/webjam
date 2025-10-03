import { DashboardCard } from '@/components/dashboard-card';
import { api } from '@/trpc/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JamEditor } from './_components/jam-editor';

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
    const { id } = await params;
    const queryParams = await searchParams;
    if (!queryParams || !('usersPerTeam' in queryParams)) {
        notFound();
    }
    const matches = await api.projects.initializeJamCreation({ id, usersPerTeam: parseInt(queryParams.usersPerTeam) });
    const profiles = await api.candidates.getMany({ ids: matches.flat() });
    const project = await api.projects.getOne({ id });

    if (!project) notFound();

    if (project?.projectInstances.length > 0) {
        return (
            <div className="h-full flex flex-col gap-2">
                <DashboardCard className="flex flex-col h-full">
                    <h1>Jams already created</h1>
                    <p>This project already has jams created. Please delete them before creating new ones.</p>
                    <Link href={`/admin/projects/${id}`}>Take me back.</Link>
                </DashboardCard>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-2">
            <DashboardCard className="flex flex-col h-full">
                <h1>Edit Jams</h1>
                <JamEditor
                    projectId={id}
                    profiles={profiles}
                    matches={matches}
                />
            </DashboardCard>
        </div>
    );
}
