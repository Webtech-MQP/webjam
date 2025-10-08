import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@/server/auth';
import { unauthorized } from 'next/navigation';

type Props = {
    admin: React.ReactNode;
    recruiter: React.ReactNode;
    candidate: React.ReactNode;
};

export default async function Layout({ recruiter, candidate }: Props) {
    const session = await auth();

    if (!session) {
        return unauthorized();
    }

    if (session.user.isCandidate && session.user.isRecruiter) {
        return (
            <div className="flex flex-col h-full">
                <Tabs
                    defaultValue="candidate"
                    className="h-full"
                >
                    <TabsList className="w-full">
                        <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
                        <TabsTrigger value="candidate">Candidate</TabsTrigger>
                    </TabsList>
                    <TabsContent
                        value="recruiter"
                        asChild
                    >
                        {recruiter}
                    </TabsContent>
                    <TabsContent
                        value="candidate"
                        asChild
                    >
                        {candidate}
                    </TabsContent>
                </Tabs>
            </div>
        );
    } else if (session.user.isRecruiter) {
        return recruiter;
    } else {
        return candidate;
    }
}
