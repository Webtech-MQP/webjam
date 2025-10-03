import { Sidebar } from '@/components/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { auth } from '@/server/auth';
import { api } from '@/trpc/server';
import { redirect, unauthorized } from 'next/navigation';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session) {
        return unauthorized();
    }

    const isAdmin = await api.users.isAdmin();
    const candidateProfile = await api.candidates.getOne({ id: session.user.id });
    const recruiterProfile = await api.recruiters.getOne({ id: session.user.id });

    if (!candidateProfile && !recruiterProfile && !isAdmin) {
        redirect('/onboard');
    }

    // if (candidateProfile && recruiterProfile) {
    //     redirect('/sign-in/profiles');
    // }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <Toaster />
            <div className="max-h-screen w-full overflow-y-auto p-4">{children}</div>
        </div>
    );
}
