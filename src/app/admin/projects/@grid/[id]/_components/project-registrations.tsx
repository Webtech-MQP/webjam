'use client';

import { DashboardCard } from '@/components/dashboard-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { api, type RouterOutputs } from '@/trpc/react';
import { LoaderCircle, Trash } from 'lucide-react';

interface Props {
    projectId: string;
}

export function ProjectRegistrations({ projectId }: Props) {
    const { data: registrations, isLoading } = api.projectRegistration.getProjectRegistrations.useQuery({
        projectId,
    });

    if (isLoading) {
        return (
            <DashboardCard>
                <LoaderCircle className="animate-spin" />
            </DashboardCard>
        );
    }

    if (!registrations) return null;

    return (
        <DashboardCard>
            <h1>Registered users</h1>
            <div className="relative flex w-full flex-col gap-4">
                {registrations.map((r, index) => (
                    <Registration
                        key={index}
                        r={r}
                    />
                ))}
                {registrations.length === 0 && <p className="text-muted-foreground">No registrations yet.</p>}
            </div>
        </DashboardCard>
    );
}

const Registration = ({ r }: { r: RouterOutputs['projectRegistration']['getProjectRegistrations'][number] }) => {
    const utils = api.useUtils();

    const deleteRegistration = api.projectRegistration.removeRegistration.useMutation({
        onSettled: () => {
            void utils.projectRegistration.getProjectRegistrations.invalidate({ projectId: r.projectId });
        },
    });
    return (
        <div className="flex items-center gap-3">
            <div className="relative aspect-square w-8">
                <Avatar className="absolute top-0 left-0 h-full w-full rounded-full">
                    <AvatarImage src={r.candidate.imageUrl ?? ''} />
                    <AvatarFallback>{r.candidate.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
            <p className="flex-1 font-semibold">{r.candidate.displayName}</p>
            <Button
                variant="ghost"
                size="icon"
                disabled={deleteRegistration.isPending}
                onClick={() => {
                    deleteRegistration.mutate({ registrationId: r.id });
                }}
            >
                {deleteRegistration.isPending ? <LoaderCircle className="animate-spin" /> : <Trash className="hover:text-red-300 cursor-pointer" />}
            </Button>
        </div>
    );
};
