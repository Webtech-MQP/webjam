'use client';
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/trpc/react';

type LinkRepoProps = {
    id: string;
};

export function LinkRepo({ id }: LinkRepoProps) {
    const formRef = useRef<HTMLFormElement | null>(null);
    const mutation = api.projectInstances.linkRepository.useMutation();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget || formRef.current;
        if (!form) return;
        const fd = new FormData(form);
        const repo = (fd.get('repo') as string | null)?.trim() ?? '';
        if (!repo) return;
        mutation.mutate({ projectInstanceId: id, repoUrl: repo });
        form.reset();
    };

    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="text-sm font-medium">Link Repo</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <h3 className="text-lg font-semibold">Link a Repository</h3>
                        </DialogTitle>
                    </DialogHeader>
                    <form ref={formRef} onSubmit={handleSubmit} className="flex items-center space-x-3">
                        <Input name="repo" placeholder="https://github.com/owner/repo"/>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Linking...' : 'Link'}
                        </Button>
                    </form>
                    {mutation.error && <div className="text-sm text-red-400 mt-2">{mutation.error.message}</div>}
                </DialogContent>
            </Dialog>
        </>
    );
}