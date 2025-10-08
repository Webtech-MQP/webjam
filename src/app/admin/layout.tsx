import { Toaster } from '@/components/ui/sonner';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '../../components/sidebar';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session) {
        redirect('/sign-in');
    } else if (!session?.user.isAdmin) {
        redirect('/dashboard/home');
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <Toaster
                closeButton
                expand={true}
                toastOptions={{
                    classNames: {
                        closeButton: '!text-foreground',
                    },
                }}
            />
            <div className="max-h-screen w-full overflow-y-auto p-4">{children}</div>
        </div>
    );
}
