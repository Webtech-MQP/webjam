import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';

export default async function SignInLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (session) {
        redirect('/dashboard/home');
    }

    return children;
}
