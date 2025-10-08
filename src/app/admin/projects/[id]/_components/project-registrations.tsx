'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            <Card>
                <CardContent>
                    <LoaderCircle className="animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!registrations) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registered users</CardTitle>
            </CardHeader>
            <CardContent className="max-h-full overflow-auto">
                <div className="relative flex w-full flex-col gap-4 overflow-auto max-h-full">
                    {registrations.map((r, index) => (
                        <Registration
                            key={index}
                            r={r}
                        />
                    ))}
                    {registrations.length === 0 && <p className="text-muted-foreground dark:text-muted-foreground-foreground">No registrations yet.</p>}
                </div>
            </CardContent>
        </Card>
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
