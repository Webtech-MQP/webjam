'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { api, type RouterOutputs } from '@/trpc/react';
import { useForm } from '@tanstack/react-form';
import { ArrowRight, EllipsisVertical } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

type List = RouterOutputs['recruiters']['getLists'][number];
type Candidate = List['candidates'][number];

interface ListDetailProps {
    list: List;
}

interface CandidateItemProps {
    candidate: Candidate;
    list: List;
    allLists: List[];
}

export function ListDetail({ list }: ListDetailProps) {
    const { data: candidateLists } = api.recruiters.getLists.useQuery({ id: list.recruiterId });

    if (list.candidates.length === 0) {
        return <div className="text-gray-500">No candidates in this list yet.</div>;
    }

    return (
        <div className="space-y-4">
            {list.candidates.map((candidate) => (
                <CandidateItem
                    key={candidate.candidateId}
                    candidate={candidate}
                    list={list}
                    allLists={candidateLists ?? []}
                />
            ))}
        </div>
    );
}

function CandidateItem({ candidate, list, allLists }: CandidateItemProps) {
    const utils = api.useUtils();
    const [isEditingComment, setIsEditingComment] = useState(false);

    const moveCandidateToList = api.recruiters.moveCandidateToList.useMutation({
        onSuccess: () => {
            toast.success('Candidate moved successfully');
            void utils.recruiters.getLists.invalidate();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const removeCandidateFromList = api.recruiters.removeCandidateFromList.useMutation({
        onSuccess: () => {
            toast.success('Candidate removed from list');
            void utils.recruiters.getLists.invalidate();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const updateCandidateComment = api.recruiters.updateOneListCandidate.useMutation({
        onSuccess: () => {
            toast.success('Comment updated successfully');
            setIsEditingComment(false);
            void utils.recruiters.getLists.invalidate();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const commentForm = useForm({
        defaultValues: {
            comment: candidate.comments ?? '',
        },
        onSubmit: async ({ value }) => {
            updateCandidateComment.mutate({
                candidateId: candidate.candidateId,
                listId: list.id,
                comments: value.comment,
            });
        },
    });

    const handleMoveCandidate = (toListId: string) => {
        moveCandidateToList.mutate({
            candidateId: candidate.candidateId,
            fromListId: list.id,
            toListId,
        });
    };

    const handleRemoveCandidate = () => {
        removeCandidateFromList.mutate({
            candidateId: candidate.candidateId,
            listId: list.id,
        });
    };

    return (
        <div className="flex flex-col items-start gap-4 w-full border rounded overflow-clip">
            <div className="relative h-20 w-full">
                <Image
                    src={candidate.candidateProfile.imageUrl ?? ''}
                    alt={candidate.candidateProfile.displayName}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="w-full p-4">
                <div className="flex w-full">
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage
                                src={candidate.candidateProfile.imageUrl ?? ''}
                                alt={candidate.candidateProfile.displayName}
                            />
                            <AvatarFallback className="bg-gray-200">{candidate.candidateProfile.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <p className="font-bold text-2xl">{candidate.candidateProfile.displayName}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                onClick={(e) => e.stopPropagation()}
                                className="ml-auto"
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
                                        {allLists
                                            .filter((l) => l.id !== list.id)
                                            .map((cl) => (
                                                <DropdownMenuItem
                                                    key={cl.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMoveCandidate(cl.id);
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
                                    setIsEditingComment(true);
                                }}
                            >
                                Edit comment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCandidate();
                                }}
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {isEditingComment ? (
                    <form
                        className="flex flex-col gap-2 mt-4 w-full"
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            void commentForm.handleSubmit();
                        }}
                    >
                        <commentForm.Field name="comment">
                            {(field) => (
                                <textarea
                                    className="border border-black rounded p-2 w-full"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    onBlur={field.handleBlur}
                                    rows={3}
                                    placeholder="Add a comment about this candidate..."
                                />
                            )}
                        </commentForm.Field>
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={updateCandidateComment.isPending}
                            >
                                {updateCandidateComment.isPending ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                    setIsEditingComment(false);
                                    commentForm.reset();
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    candidate.comments && <p className="mt-4 text-gray-500">{candidate.comments}</p>
                )}
            </div>
            <Link
                href={`/users/${candidate.candidateId}`}
                className="flex items-center gap-4 justify-center bg-secondary w-full p-2"
            >
                Go to candidate <ArrowRight />
            </Link>
        </div>
    );
}
