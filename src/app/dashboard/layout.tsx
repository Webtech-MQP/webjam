import { auth } from '@/server/auth';
import { api } from '@/trpc/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '../../components/sidebar';
import { Toaster } from '@/components/ui/sonner';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session) {
        redirect('/');
    }

    const isAdmin = await api.users.isAdmin();
    const candidateProfile = await api.candidates.getOne({ id: session.user.id });
    const recruiterProfile = await api.recruiters.getOne({ id: session.user.id });

    if (!candidateProfile && !recruiterProfile && !isAdmin) {
        redirect('/onboard');
    }

    if (recruiterProfile && candidateProfile) {
        redirect(`/sign-in/${session.user.id}/profiles`);
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <Toaster />
            <div className="max-h-screen w-full overflow-y-auto p-4">{children}</div>
        </div>
    );
}
