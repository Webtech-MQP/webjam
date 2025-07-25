import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/');
    }

    return (
        <div className="flex h-full flex-col items-center justify-center">
            <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-600">This is the dashboard page.</p>
        </div>
    );
}
