import { OnboardingWizard } from '@/features/profiles/onboarding/form';
import { auth } from '@/server/auth';
import { api } from '@/trpc/server';
import { redirect } from 'next/navigation';

export default async function Page() {
    const session = await auth();

    if (!session) redirect('/sign-in');

    const user = await api.candidates.getOne({ id: session.user.id });

    if (user) redirect(`/users/${session.user.id}/edit`);

    return (
        <div className="h-screen w-full flex items-center justify-center">
            <div className="w-full max-w-lg">
                <OnboardingWizard />
            </div>
        </div>
    );
}
