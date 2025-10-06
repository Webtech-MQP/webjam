'use client';

import type { RouterOutputs } from '@/trpc/react';
import { api } from '@/trpc/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DashboardCard } from './dashboard-card';

type Profile = RouterOutputs['candidates']['getOne'] | RouterOutputs['recruiters']['getOne'];

export default function ProfileCard({ profile }: { profile: Profile }) {
    const router = useRouter();
    const updateRole = api.users.updateOne.useMutation();
    const isCandidate = profile && 'language' in profile;

    if (!profile) return null;

    return (
        <DashboardCard
            className="flex items-center gap-8 w-full max-w-2xl border text-foreground rounded-xl shadow-md p-6 transition-all duration-200 cursor-pointer hover:border-primary hover:shadow-lg"
            onClick={async () => {
                await updateRole.mutateAsync({
                    id: profile.userId,
                    role: isCandidate ? 'candidate' : 'recruiter',
                });
                router.push('/dashboard/home');
            }}
        >
            <Image
                src={profile?.imageUrl ?? 'https://placehold.co/100x100/png'}
                alt="Profile Image"
                width={100}
                height={100}
                className="rounded-full border border-gray-700 shadow-sm"
            />
            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold text-primary mb-1">{isCandidate ? 'Candidate' : 'Recruiter'} Profile</h2>
                <p className="font-medium text-lg">{profile?.displayName}</p>
                <p className="text-gray-300">{}</p>
            </div>
        </DashboardCard>
    );
}
