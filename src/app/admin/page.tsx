import { auth } from '@/server/auth';
import AdminCreateEditProject from './components/create-edit-project';

export default async function AdminDashboardPage() {
    const session = await auth();

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome {session?.user.name}</p>
            <AdminCreateEditProject projectId={undefined} />
        </div>
    );
}
