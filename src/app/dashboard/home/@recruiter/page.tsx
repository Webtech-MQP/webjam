'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/trpc/react';
import { skipToken } from '@tanstack/react-query';
import { LoaderCircle, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ListDetail } from './_components/list-detail';

export default function RecruiterDashboardPage() {
    const session = useSession();
    const utils = api.useUtils();
    const [activeList, setActiveList] = useState<string | null>(null);
    const [listName, setListName] = useState<string>('');

    const userId = session.data?.user.id;
    const { data: me, ...recruiterQuery } = api.recruiters.getOne.useQuery(userId ? { id: userId } : skipToken); // TODO: probably get rid of this
    const { data: candidateLists, ...candidateListsQuery } = api.recruiters.getLists.useQuery(userId ? { id: userId } : skipToken);
    const createList = api.recruiters.createOneList.useMutation({
        onSuccess: () => {
            void utils.recruiters.getLists.invalidate();
        },
    });

    useEffect(() => {
        if (candidateListsQuery.isSuccess && candidateLists && candidateLists.length > 0 && candidateLists[0] && !activeList) {
            setActiveList(candidateLists[0].id);
        }
    }, [candidateListsQuery.isSuccess, candidateLists, activeList]);

    if (session.status === 'loading' || candidateListsQuery.isLoading || recruiterQuery.isLoading) {
        return (
            <div className="-m-4 p-8 bg-neutral-100 text-black">
                <div className="h-screen overflow-y-hidden flex items-center justify-center animate-spin">
                    <LoaderCircle />
                </div>
            </div>
        );
    }

    if (candidateListsQuery.isError || recruiterQuery.isError) {
        return notFound();
    }

    return (
        <div className="bg-neutral-50 min-h-screen -m-4 p-8 text-black">
            {me && <h1 className="text-3xl font-bold mb-8">Hello, {session.data?.user.name}!</h1>}
            <div className="flex gap-4">
                <div className="flex flex-col gap-2 w-1/4">
                    {!!candidateLists && candidateLists.length > 0 ? (
                        candidateLists.map((list) => (
                            <button
                                className="relative cursor-pointer text-sm px-4 py-2 pl-6 rounded bg-none text-left"
                                style={{
                                    backgroundColor: getBackgroundColor(list.name, 0.2),
                                    outline: activeList == list.id ? `2px solid ${getBackgroundColor(list.name, 1)} ` : undefined,
                                }}
                                key={list.id}
                                onClick={() => setActiveList(list.id)}
                            >
                                {list.name}
                                <div
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor: getBackgroundColor(list.name, 1),
                                    }}
                                />
                            </button>
                        ))
                    ) : (
                        <div className="text-gray-500">You have no candidate lists yet. Create one to get started!</div>
                    )}
                    <div className="relative">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (listName.trim() === '') return;
                                createList.mutate({
                                    name: listName,
                                });
                                setListName('');
                            }}
                        >
                            <Input
                                placeholder="List name"
                                className="pr-10 border border-muted-foreground "
                                value={listName}
                                onChange={(e) => setListName(e.target.value)}
                                disabled={createList.isPending}
                            />
                            <Button
                                type="submit"
                                className=" w-6 h-6 rounded absolute top-1/2 right-2 -translate-y-1/2 z-10"
                                size="icon"
                                disabled={createList.isPending}
                            >
                                {createList.isPending ? <LoaderCircle className="animate-spin" /> : <Plus />}
                            </Button>
                        </form>
                    </div>
                </div>
                <div className="flex-1">
                    {!!activeList && !!candidateLists ? (
                        <ListDetail
                            key={activeList}
                            list={candidateLists.find((list) => list.id === activeList)!}
                        />
                    ) : (
                        <div className="text-gray-500">You have no candidate lists yet. Create one to get started!</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getBackgroundColor(stringInput: string, opacity: number) {
    const stringUniqueHash = [...stringInput].reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `hsl(${stringUniqueHash % 360} 95% 35% / ${opacity})`;
}
