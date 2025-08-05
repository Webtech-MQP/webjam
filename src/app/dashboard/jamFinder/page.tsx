import { DashboardCard } from '@/components/dashboard-card';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import JamFinderClient from './JamFinderClient';
import { api } from '@/trpc/server';

export default async function JamFinderPage() {
    const session = await auth();
    if (!session?.user) redirect('/');
    const candidate = await api.candidates.getOne({ id: session.user.id });
    const isCandidate = !!candidate;

    return (
        <DashboardCard className="h-full">
            <JamFinderClient isCandidate={isCandidate}/>
        </DashboardCard>
    );
}
