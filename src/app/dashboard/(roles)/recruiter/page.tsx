'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/features/profiles/editor/input';
import { api } from '@/trpc/react';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useForm } from '@tanstack/react-form';
import { skipToken } from '@tanstack/react-query';
import { EllipsisVertical, LoaderCircle, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function RecruiterDashboardPage() {
    const router = useRouter();
    const session = useSession();
    const utils = api.useUtils();
    const dialogCloseRef = useRef<HTMLButtonElement>(null);

    const recruiterId = session.data?.user.id;
    const { data: me, isLoading } = api.recruiters.getOne.useQuery(recruiterId ? { id: recruiterId } : skipToken);
    const candidateLists = api.recruiters.getLists.useQuery(recruiterId ? { id: recruiterId } : skipToken);

    const removeCandidateFromList = api.recruiters.removeCandidateFromList.useMutation({
        onSuccess: () => {
            void utils.recruiters.getLists.invalidate({ id: session.data?.user.id ?? '' });
        },
    });
    const moveCandidateToList = api.recruiters.moveCandidateToList.useMutation({
        onSuccess: () => {
            void utils.recruiters.getLists.invalidate({ id: session.data?.user.id ?? '' });
        },
    });
    const editCandidateComment = api.recruiters.updateOneListCandidate.useMutation({
        onSuccess: () => {
            void utils.recruiters.getLists.invalidate({ id: session.data?.user.id ?? '' });
        },
    });
    const createList = api.recruiters.createOneList.useMutation({
        onSuccess: () => {
            void utils.recruiters.getLists.invalidate({ id: session.data?.user.id ?? '' });
        },
    });

    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
        },
        onSubmit: (values) => {
            createList.mutate({
                name: values.value.name,
                description: values.value.description,
            });
        },
    });

    useEffect(() => {
        if (createList.isSuccess) {
            form.reset();
            dialogCloseRef.current?.click();
        }
    }, [form, createList.isSuccess]);

    const [editingComment, setEditingComment] = useState<{ candidateId: string; listId: string; comment: string } | null>(null);
    const [commentValue, setCommentValue] = useState('');

    if (isLoading) {
        return (
            <div className="h-screen overflow-y-hidden flex items-center justify-center animate-spin">
                <LoaderCircle />
            </div>
        );
    }

    return (
        <div className="min-h-screen -m-4 p-8 bg-neutral-100 text-black">
            {me && <h1 className="text-3xl font-bold mb-2">Hello, {session.data?.user.name}!</h1>}
            <p className="mb-8 text-gray-600">Welcome! Here you can manage your lists of candidates.</p>

            {candidateLists.data && candidateLists.data.length > 0 && candidateLists.data[0] ? (
                <Tabs
                    defaultValue={candidateLists.data[0].id}
                    className="w-full"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <TabsList className="bg-gray-300">
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
                                <DialogTitle>Create a new candidate list</DialogTitle>
                                <div className="flex flex-col gap-4">
                                    <form
                                        className="flex flex-col gap-4"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                        }}
                                    >
                                        <form.Field
                                            name="name"
                                            validators={{
                                                onChange: ({ value }) => (!value.trim() ? 'Reason is required.' : undefined),
                                            }}
                                        >
                                            {(field) => (
                                                <div className="flex flex-col gap-1">
                                                    <Input
                                                        type="input"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange((e.target as HTMLInputElement).value)}
                                                        label="Name"
                                                    />
                                                    {!field.state.meta.isValid && field.state.meta.errors.length > 0 && <span className="text-xs text-red-500">{field.state.meta.errors.join(', ')}</span>}
                                                </div>
                                            )}
                                        </form.Field>
                                        <form.Field name="description">
                                            {(field) => (
                                                <div className="flex flex-col gap-1">
                                                    <Input
                                                        type="textarea"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        className="w-full"
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        label="Description"
                                                    />
                                                    {!field.state.meta.isValid && field.state.meta.errors.length > 0 && <span className="text-xs text-red-500">{field.state.meta.errors.join(', ')}</span>}
                                                </div>
                                            )}
                                        </form.Field>
                                        <DialogClose asChild>
                                            <button
                                                type="button"
                                                ref={dialogCloseRef}
                                                className="hidden"
                                            />
                                        </DialogClose>
                                        <Button
                                            onClick={() => form.handleSubmit()}
                                            type="submit"
                                        >
                                            {createList.isPending && <LoaderCircle className="animate-spin" />}
                                            Submit report
                                        </Button>
                                    </form>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {candidateLists.data?.map((list) => (
                        <TabsContent
                            key={list.id}
                            value={list.id}
                            className="flex flex-col gap-8 items-center justify-center"
                        >
                            {list.candidates.length === 0 ? (
                                <div className="text-gray-500">No candidates in this list yet.</div>
                            ) : (
                                list.candidates.map((candidate) => (
                                    <div
                                        key={candidate.candidateId}
                                        className="flex items-center justify-between w-full cursor-pointer"
                                        onClick={() => router.push(`/users/${candidate.candidateId}`)}
                                    >
                                        <div className="flex items-center gap-4 w-full">
                                            <Image
                                                src={candidate.candidateProfile.imageUrl ?? ''}
                                                alt={candidate.candidateProfile.displayName}
                                                height={50}
                                                width={50}
                                                className="rounded-full"
                                            />
                                            <div className="w-full">
                                                <p className="font-bold text-2xl">{candidate.candidateProfile.displayName}</p>
                                                {editingComment && editingComment.candidateId === candidate.candidateId && editingComment.listId === list.id ? (
                                                    <form
                                                        className="flex flex-col gap-2 mt-2 w-full"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            editCandidateComment.mutate({
                                                                candidateId: candidate.candidateId,
                                                                listId: list.id,
                                                                comments: commentValue,
                                                            });
                                                            setEditingComment(null);
                                                        }}
                                                    >
                                                        <textarea
                                                            className="border border-black rounded p-2 w-full"
                                                            value={commentValue}
                                                            onChange={(e) => setCommentValue(e.target.value)}
                                                            rows={2}
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="submit"
                                                                size="sm"
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setEditingComment(null)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    candidate.comments && <p className="text-gray-500">{candidate.comments}</p>
                                                )}
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <EllipsisVertical />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className="w-56"
                                                align="end"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            {candidateLists.data
                                                                .filter((l) => l.id !== list.id)
                                                                .map((cl) => (
                                                                    <DropdownMenuItem
                                                                        key={cl.id}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            moveCandidateToList.mutate({ candidateId: candidate.candidateId, fromListId: list.id, toListId: cl.id });
                                                                        }}
                                                                    >
                                                                        {cl.name}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingComment({ candidateId: candidate.candidateId, listId: list.id, comment: candidate.comments ?? '' });
                                                        setCommentValue(candidate.comments ?? '');
                                                    }}
                                                >
                                                    Edit comment
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeCandidateFromList.mutate({ candidateId: candidate.candidateId, listId: list.id });
                                                    }}
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
