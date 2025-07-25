import { api } from '@/trpc/server';

type Params = {
    userId: string;
};

type Props = {
    params: Promise<Params>;
    candidate: React.ReactNode;
};

export default async function Layout({ candidate, params }: Props) {
    const userId = decodeURIComponent((await params).userId);
    const c = await api.candidates.getOne(userId.startsWith('@') ? { githubUsername: userId.slice(1) } : { id: userId });

    //TODO: If user is recruiter, render recruiter profile

    if (!c) {
        return <div>User not found</div>;
    }

    return candidate;
}
