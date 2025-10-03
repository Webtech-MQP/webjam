import { auth } from '@/server/auth';
import { unauthorized } from 'next/navigation';

type Props = {
    admin: React.ReactNode;
    recruiter: React.ReactNode;
    candidate: React.ReactNode;
};

export default async function Layout({ admin, recruiter, candidate }: Props) {
    const session = await auth();

    if (!session) {
        return unauthorized();
    }

    switch (session.user.role) {
        case 'admin':
            return admin;
        case 'recruiter':
            return recruiter;
        case 'candidate':
            return candidate;
        default:
            return null;
    }
}
