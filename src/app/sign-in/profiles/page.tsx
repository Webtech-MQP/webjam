import ProfileCard from '@/components/profile-card';
import { auth } from '@/server/auth';
import { api } from '@/trpc/server';
import * as motion from 'motion/react-client';
import { redirect } from 'next/navigation';

export default async function ProfilesPage() {
    const session = await auth();
    if (!session) redirect('/');

    const candidateProfile = await api.candidates.getOne({ id: session.user.id });
    const recruiterProfile = await api.recruiters.getOne({ id: session.user.id });

    return (
        <motion.div
            className="flex flex-col items-center justify-center mx-72 h-screen gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
        >
            <h1>Select which profile you would like to view:</h1>
            {candidateProfile && <ProfileCard profile={candidateProfile} />}
            {recruiterProfile && <ProfileCard profile={recruiterProfile} />}
        </motion.div>
    );
}
