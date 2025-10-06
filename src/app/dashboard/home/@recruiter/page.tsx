'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/trpc/react';
import { skipToken } from '@tanstack/react-query';
import { Check, LoaderCircle, Pencil, Plus, Trash } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ListDetail } from './_components/list-detail';

export default function RecruiterDashboardPage() {
    const session = useSession();
    const utils = api.useUtils();
    const [activeList, setActiveList] = useState<string | null>(null);
    const [listName, setListName] = useState<string>('');
    const [editingListName, setEditingListName] = useState<string>('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const userId = session.data?.user.id;
    const { data: me, ...recruiterQuery } = api.recruiters.getOne.useQuery(userId ? { id: userId } : skipToken); // TODO: probably get rid of this
    const { data: candidateLists, ...candidateListsQuery } = api.recruiters.getLists.useQuery(userId ? { id: userId } : skipToken);
    const createList = api.recruiters.createOneList.useMutation({
        onSuccess: () => {
            void utils.recruiters.getLists.invalidate();
        },
    });
    const deleteList = api.recruiters.deleteOneList.useMutation({
        onSuccess: () => {
            void utils.recruiters.getLists.invalidate();
        },
    });
    const updateList = api.recruiters.updateOneList.useMutation({
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
        <div className="min-h-screen -m-4 p-8 ">
            {me && <h1 className="text-3xl font-bold mb-8">Hello, {session.data?.user.name}!</h1>}
            <div className="flex gap-4">
                <div className="flex flex-col gap-2 w-1/4">
                    {!!candidateLists && candidateLists.length > 0 ? (
                        candidateLists.map((list) => (
                            <div
                                key={list.id}
                                className="flex items-center h-12 gap-0 rounded px-4 py-2"
                                style={{
                                    backgroundColor: getBackgroundColor(list.name, 0.2),
                                    outline: activeList == list.id ? `2px solid ${getBackgroundColor(list.name, 1)} ` : undefined,
                                }}
                            >
                                <button
                                    className="max-w-full overflow-auto flex flex-1 border-r-none items-center gap-2 cursor-pointer text-sm bg-none text-left"
                                    onClick={() => setActiveList(list.id)}
                                >
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                            backgroundColor: getBackgroundColor(list.name, 1),
                                        }}
                                    />
                                    {editingId === list.id ? (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                updateList.mutate({ id: list.id, name: editingListName });
                                                setEditingListName('');
                                                setEditingId(null);
                                            }}
                                            className="flex-1 pr-2"
                                        >
                                            <input
                                                value={editingListName}
                                                onChange={(e) => setEditingListName(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                autoFocus
                                                className="min-w-0 w-full"
                                            />
                                        </form>
                                    ) : (
                                        <span className="flex-1 truncate">{list.name}</span>
                                    )}
                                </button>
                                <div className="gap-2 flex flex-row-reverse items-center x-2">
                                    <Button
                                        size="icon"
                                        className="w-4 h-4"
                                        variant="ghost"
                                        onClick={() => deleteList.mutate({ id: list.id })}
                                    >
                                        <Trash />
                                    </Button>
                                    <Button
                                        size="icon"
                                        className="w-4 h-4"
                                        variant="ghost"
                                        onClick={() => {
                                            if (editingId === list.id) {
                                                setEditingListName(list.name);
                                                setEditingId(null);
                                            } else {
                                                setEditingListName(list.name);
                                                setEditingId(list.id);
                                            }
                                        }}
                                        type={editingId ? 'submit' : 'button'}
                                    >
                                        {editingId === list.id ? <Check /> : <Pencil />}
                                    </Button>
                                </div>
                            </div>
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
                                className="pr-10 border"
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
