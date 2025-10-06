'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/features/profiles/editor/input';
import { api } from '@/trpc/react';
import { useForm } from '@tanstack/react-form';
import { skipToken } from '@tanstack/react-query';
import { Ellipsis, LoaderCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface UserActionsMenuProps {
    reportedUserName: string;
    reportedUserId: string;
}

export function UserActionsMenu({ reportedUserName, reportedUserId }: UserActionsMenuProps) {
    const dialogCloseRef = useRef<HTMLButtonElement>(null);
    const session = useSession();
    const utils = api.useUtils();

    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [selectedListName, setSelectedListName] = useState<string | null>(null);
    const [comment, setComment] = useState('');
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);

    const userId = session.data?.user.id;
    const createReport = api.reports.create.useMutation({
        onSuccess: () => {
            toast.success('Report submitted successfully. The team will review it shortly.');
            form.reset();
            dialogCloseRef.current?.click();
        },
    });

    const candidateLists = api.recruiters.getLists.useQuery(userId && session?.data?.user.role === 'recruiter' ? { id: userId } : skipToken);
    const addCandidateToList = api.recruiters.createOneListCandidate.useMutation({
        onSuccess: () => {
            toast.success('Candidate added to list!');
            setCommentDialogOpen(false);
            setComment('');
            setSelectedListId(null);
            setSelectedListName(null);
            void utils.recruiters.getLists.invalidate({ id: userId });
        },
        onError: (e) => {
            toast.error(e.message);
        },
    });

    const form = useForm({
        defaultValues: {
            reason: '',
            description: '',
        },
        onSubmit: (values) => {
            createReport.mutate({
                candidateId: reportedUserId,
                reason: values.value.reason,
                description: values.value.description,
            });
        },
    });

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        className="ml-auto"
                        variant="ghost"
                        size="sm"
                    >
                        <Ellipsis />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-56"
                    align="end"
                >
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {session.data?.user.role === 'recruiter' && (
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Add {reportedUserName} to</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        {candidateLists.data?.map((list) => (
                                            <DropdownMenuItem
                                                key={list.id}
                                                onClick={() => {
                                                    setSelectedListId(list.id);
                                                    setCommentDialogOpen(true);
                                                    setComment('');
                                                    setSelectedListName(list.name);
                                                    console.log(selectedListId);
                                                }}
                                            >
                                                {list.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        )}
                        <Dialog>
                            <DialogTrigger asChild>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    Report User
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Reporting {reportedUserName}</DialogTitle>
                                    <DialogDescription>Please provide a reason and a description for reporting this user.</DialogDescription>
                                </DialogHeader>
                                <form
                                    className="flex flex-col gap-4"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                    }}
                                >
                                    <form.Field
                                        name="reason"
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
                                                    label="Reason"
                                                />
                                                {!field.state.meta.isValid && field.state.meta.errors.length > 0 && <span className="text-xs text-red-500">{field.state.meta.errors.join(', ')}</span>}
                                            </div>
                                        )}
                                    </form.Field>
                                    <form.Field
                                        name="description"
                                        validators={{
                                            onChange: ({ value }) => (!value.trim() ? 'Description is required.' : undefined),
                                        }}
                                    >
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
                                </form>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button
                                            variant="outline"
                                            ref={dialogCloseRef}
                                            onClick={() => form.reset()}
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        onClick={() => form.handleSubmit()}
                                        type="submit"
                                    >
                                        {createReport.isPending && <LoaderCircle className="animate-spin" />}
                                        Submit report
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog
                open={commentDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setCommentDialogOpen(false);
                        setComment('');
                        setSelectedListId(null);
                        setSelectedListName(null);
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Add {reportedUserName} to {selectedListName}
                        </DialogTitle>
                        <DialogDescription>Optionally add a comment for this candidate.</DialogDescription>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (selectedListId) {
                                addCandidateToList.mutate({
                                    listId: selectedListId,
                                    candidateId: reportedUserId,
                                    comments: comment,
                                });
                            }
                        }}
                    >
                        <Input
                            type="textarea"
                            label="Comment (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full"
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setCommentDialogOpen(false);
                                        setComment('');
                                        setSelectedListId(null);
                                        setSelectedListName(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                disabled={addCandidateToList.isPending}
                            >
                                {addCandidateToList.isPending && <LoaderCircle className="animate-spin" />} Add to List
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
