'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/trpc/react';
import { skipToken } from '@tanstack/react-query';
import { EllipsisVertical, LoaderCircle, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function RecruiterDashboardPage() {
    const session = useSession();
    const utils = api.useUtils();

    const recruiterId = session.data?.user.id;
    const { data: me, isLoading } = api.recruiters.getOne.useQuery(recruiterId ? { id: recruiterId } : skipToken);

    const candidateLists = api.recruiters.getLists.useQuery(recruiterId ? { id: recruiterId } : skipToken);
    console.log('Candidate Lists:', candidateLists.data?.[0]);

    const removeCandidateFromList = api.recruiters.removeCandidateFromList.useMutation({
        onSuccess: () => {
            void utils.recruiters.getLists.invalidate({ id: session.data?.user.id ?? '' });
        },
    });

    if (isLoading) {
        return (
            <div className="h-screen overflow-y-hidden flex items-center justify-center animate-spin">
                <LoaderCircle />
            </div>
        );
    }

    return (
        <div className="min-h-screen -m-4 p-8 ">
            {me && <h1 className="text-3xl font-bold mb-2">Hello, {session.data?.user.name}!</h1>}
            <p className="mb-8 text-gray-600">Welcome! Here you can manage your favorite candidates and more.</p>

            {candidateLists.data && candidateLists.data.length > 0 && candidateLists.data[0] ? (
                <Tabs
                    defaultValue={candidateLists.data[0].id}
                    className="w-full"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <TabsList>
                            {candidateLists.data &&
                                candidateLists.data.length > 0 &&
                                candidateLists.data.map((list) => (
                                    <TabsTrigger
                                        key={list.id}
                                        value={list.id}
                                    >
                                        {list.name}
                                    </TabsTrigger>
                                ))}
                        </TabsList>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="ml-2">
                                    <Plus />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-xl font-bold">Create New Candidate List</h2>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="List Name"
                                        className="border p-2 rounded w-full"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="description"
                                        placeholder="Description (optional)"
                                        className="border p-2 rounded w-full"
                                    />
                                    <Button type="submit">Create List</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {candidateLists.data?.map((list) => (
                        <TabsContent
                            key={list.id}
                            value={list.id}
                            className="flex items-center justify-center"
                        >
                            {list.candidates.length === 0 ? (
                                <div
                                    key="no-candidates"
                                    className="text-gray-500"
                                >
                                    No candidates in this list yet.
                                </div>
                            ) : (
                                list.candidates.map((candidate) => (
                                    <div
                                        key={candidate.candidateId}
                                        className="flex items-center justify-between w-full"
                                    >
                                        <Image
                                            src={candidate.candidateProfile.imageUrl ?? ''}
                                            alt={candidate.candidateProfile.displayName}
                                            height={48}
                                            width={48}
                                            className="rounded-full"
                                        />
                                        <div>
                                            <p>{candidate.candidateProfile.displayName}</p>
                                            <p>{candidate.comments}</p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline">
                                                    <EllipsisVertical />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className="w-56"
                                                align="end"
                                            >
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            {candidateLists.data.map((list) => (
                                                                <DropdownMenuItem key={list.id}>{list.name}</DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuItem>Edit comment</DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-500"
                                                    onClick={() => removeCandidateFromList.mutate({ candidateId: candidate.candidateId, listId: list.id })}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                <div className="text-gray-500">You have no candidate lists yet. Create one to get started!</div>
            )}
        </div>
    );
}
