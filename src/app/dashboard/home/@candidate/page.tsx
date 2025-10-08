'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, type RouterOutputs } from '@/trpc/react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type Jam = RouterOutputs['projectInstances']['getMyProjectInstances'][number];

const JamLink = ({ jam }: { jam: Jam }) => {
    return (
        <Link
            key={jam.id}
            href={`/dashboard/jams/${jam.id}`}
        >
            <div className="w-full border-l-2 pl-4 hover:border-primary">
                <p className="text-primary text-lg font-bold">{jam.project.title}</p>
                <p className="font-mono">{jam.teamName}</p>
                <p className="mt-4 text-muted-foreground">Ends {jam.project.endDateTime.toLocaleDateString()}</p>
            </div>
        </Link>
    );
};

export default function CandidatePage() {
    const { data: myInstances } = api.projectInstances.getMyProjectInstances.useQuery();

    const active = myInstances?.filter((instance) => instance.project.status === 'created');
    const rest = myInstances?.filter((instance) => instance.project.status !== 'created');

    return (
        <div className="h-full flex flex-col gap-2">
            <Card>
                <CardHeader>
                    <CardTitle>
                        My <span className="text-primary">Active</span> Jams
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {active?.map((instance) => (
                        <JamLink
                            jam={instance}
                            key={instance.id}
                        />
                    ))}
                    {active?.length === 0 && (
                        <div className="w-full border-l-2 pl-4 hover:border-primary">
                            <p className="font-mono">You have no active jams</p>
                        </div>
                    )}
                    <Button variant={active?.length === 0 ? 'default' : 'secondary'}>
                        Find a Jam <ArrowRight />
                    </Button>
                </CardContent>
            </Card>
            <Card className="flex-1">
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {rest?.map((instance) => (
                        <JamLink
                            jam={instance}
                            key={instance.id}
                        />
                    ))}
                    {rest?.length === 0 && (
                        <div className="w-full">
                            <p className="font-mono text-muted-foreground">You have no Jam history. Complete a Jam see your history.</p>
                        </div>
                    )}
                </CardContent>
            </Card>{' '}
        </div>
    );
}
