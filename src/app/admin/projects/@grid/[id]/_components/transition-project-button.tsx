'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '@/trpc/react';
import { Check, Gavel } from 'lucide-react';

export function TransitionProjectButton({ projectId, status }: { projectId: string; status: 'created' | 'judging' | 'completed' }) {
    const updateStatus = api.projects.updateStatus.useMutation();
    const newStatus = status === 'judging' ? 'completed' : 'judging';

    if (status === 'completed') return null;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="default"
                    size="icon"
                    onClick={async () => {
                        await updateStatus.mutateAsync({ id: projectId, status: newStatus });
                        window.location.reload();
                    }}
                >
                    {status === 'created' && <Gavel />}
                    {status === 'judging' && <Check />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{newStatus === 'judging' ? 'Start project judging phase.' : 'Finish judging phase.'}</TooltipContent>
        </Tooltip>
    );
}
