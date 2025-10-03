'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const inputRef = (element: HTMLInputElement) => element?.focus();

export function CreateJamsButton({ projectId }: { projectId: string }) {
    const [isCreating, setIsCreating] = useState(false);
    const [usersPerTeam, setUsersPerTeam] = useState('');

    const router = useRouter();

    const filterNumInput = (old: string, value: string) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1) return old;
        return num.toString();
    };

    const clear = () => {
        setUsersPerTeam('');
        setIsCreating(false);
    };

    return (
        <>
            {isCreating ? (
                <form
                    className="flex gap-0"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void router.push(`/admin/projects/${projectId}/jamify?usersPerTeam=${usersPerTeam}`);
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
                        value={usersPerTeam}
                        onChange={(e) => setUsersPerTeam((old) => filterNumInput(old, e.target.value))}
                        type="text"
                        placeholder="# users per team"
                        className="w-fit rounded-none"
                    />
                    <Button
                        variant="default"
                        size="icon"
                        className="rounded-l-none"
                        disabled={usersPerTeam === ''}
                        type="submit"
                    >
                        <ArrowRight />
                    </Button>
                </form>
            ) : (
                <Button
                    onClick={() => {
                        setIsCreating(true);
                    }}
                >
                    Create jams <ArrowRight />
                </Button>
            )}
        </>
    );
}
