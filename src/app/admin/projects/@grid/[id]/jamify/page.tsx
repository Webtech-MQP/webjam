import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/trpc/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JamEditor } from './_components/jam-editor';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const matches = await api.projects.initializeJamCreation({ id });
    const profiles = await api.candidates.getMany({ ids: matches.teams.flat() });
    const project = await api.projects.getOne({ id });

    if (!project) notFound();

    if (project?.projectInstances.length > 0) {
        return (
            <div className="h-full flex flex-col gap-2">
                <Card className="flex flex-col h-full">
                    <CardHeader>Jams already created</CardHeader>
                    <CardContent>
                        <p>This project already has jams created. Please delete them before creating new ones.</p>
                        <Link href={`/admin/projects/${id}`}>Take me back.</Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-2">
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle>Edit Jams</CardTitle>
                </CardHeader>
                <CardContent>
                    <JamEditor
                        projectId={id}
                        profiles={profiles}
                        matches={matches}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
