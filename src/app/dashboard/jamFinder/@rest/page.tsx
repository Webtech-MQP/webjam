import { DashboardCard } from '@/components/dashboard-card';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import JamFinderClient from '../_components/JamFinderClient';

export default async function JamFinderPage() {
    const session = await auth();
    if (!session?.user) redirect('/');

    return (
        <DashboardCard className="h-full">
            <JamFinderClient />
        </DashboardCard>
    );
}
