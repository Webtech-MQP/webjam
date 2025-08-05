import { Toaster } from '@/components/ui/sonner';
import { auth } from '@/server/auth';
import { api } from '@/trpc/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '../../components/sidebar';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const isAdmin = await api.users.isAdmin();
    if (!session?.user || !isAdmin) {
        redirect('/signIn');
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <Toaster expand={true} />
            <div className="max-h-screen w-full overflow-y-auto p-4">{children}</div>
        </div>
    );
}
