'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/trpc/react';
import { ArrowRight, Link, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import z from 'zod';

const inputRef = (element: HTMLInputElement) => element?.focus();

export function LinkRepoButton({ projectInstanceId }: { projectInstanceId: string }) {
    const router = useRouter();

    const [isLinking, setIsLinking] = useState(false);
    const [repoUrl, setRepoUrl] = useState('');

    const clear = () => {
        setRepoUrl('');
        setIsLinking(false);
    };

    const updateProjectInstance = api.projectInstances.updateOne.useMutation({
        onSuccess: () => {
            router.refresh();
        },
    });

    return (
        <>
            {isLinking ? (
                <form
                    className="flex gap-0"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const parsed = z
                            .string()
                            .refine((v) => v.match(/^(?:https:\/\/)?github.com\/[^\/]+\/[^\/]+\/?$/))
                            .or(z.string().length(0))
                            .safeParse(repoUrl);

                        if (!parsed.success) {
                            return;
                        }

                        updateProjectInstance.mutate({
                            id: projectInstanceId,
                            repoUrl,
                        });

                        clear();
                    }}
                >
                    <Button
                        onClick={clear}
                        variant="secondary"
                        size="icon"
                        className="rounded-r-none"
                        type="button"
                    >
                        <X />
                    </Button>
                    <Input
                        ref={inputRef}
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        type="text"
                        placeholder="Repository URL"
                        className="w-fit rounded-none"
                    />
                    <Button
                        variant="default"
                        size="icon"
                        className="rounded-l-none"
                        disabled={repoUrl === ''}
                        type="submit"
                    >
                        <ArrowRight />
                    </Button>
                </form>
            ) : (
                <Button
                    onClick={() => {
                        setIsLinking(true);
                    }}
                    variant="secondary"
                    size="icon"
                >
                    <Link />
                </Button>
            )}
        </>
    );
}
