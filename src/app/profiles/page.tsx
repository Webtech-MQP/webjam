import { DashboardCard } from '@/components/dashboard-card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { auth } from '@/server/auth';
import { api } from '@/trpc/server';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function ProfilesPage() {
    const session = await auth();
    if (!session) {
        redirect('/');
    }

    const candidateProfile = await api.candidates.getOne({ id: session.user.id });
    const recruiterProfile = await api.recruiters.getOne({ id: session.user.id });

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1>Select which profile you would like to view:</h1>
            <RadioGroup>
                {candidateProfile && (
                    <DashboardCard className="flex items-center gap-8 w-full">
                        <RadioGroupItem
                            value="candidate"
                            id="candidate-profile"
                        />
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-bold">Candidate Profile</h2>
                            <div className="flex gap-2 items-center">
                                <Image
                                    src={candidateProfile.imageUrl ?? 'https://placehold.co/100x100/png'}
                                    alt="Profile Image"
                                    width={100}
                                    height={100}
                                    className="rounded-full"
                                />
                                <p>Name: {candidateProfile.displayName}</p>
                                <p>GitHub Username: {candidateProfile.user.githubUsername}</p>
                            </div>
                        </div>
                    </DashboardCard>
                )}
                {recruiterProfile && (
                    <DashboardCard className="flex items-center gap-8 w-full">
                        <RadioGroupItem
                            value="recruiter"
                            id="recruiter-profile"
                        />
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-bold">Recruiter Profile</h2>
                            <div className="flex gap-2 items-center">
                                <Image
                                    src={recruiterProfile.imageUrl ?? 'https://placehold.co/100x100/png'}
                                    alt="Profile Image"
                                    width={100}
                                    height={100}
                                    className="rounded-full"
                                />
                                <div>
                                    <p>Name: {recruiterProfile.displayName}</p>
                                    <p>Contact Email: {recruiterProfile.displayEmail}</p>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                )}
            </RadioGroup>
        </div>
    );
}
