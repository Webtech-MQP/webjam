'use client';

import { OnboardingWizard } from '@/features/profiles/onboarding/form';
import { motion } from 'motion/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Page() {
    const session = useSession();
    const router = useRouter();

    if (session.status === 'unauthenticated') void router.replace('/signIn');

    return (
        <div className="h-screen w-full flex items-center justify-center">
            <div className="w-full max-w-md">
                <motion.div
                    animate={{ opacity: 1 }}
                    className="opacity-0"
                    transition={{ duration: 1 }}
                >
                    <OnboardingWizard />
                </motion.div>
            </div>
        </div>
    );
}
