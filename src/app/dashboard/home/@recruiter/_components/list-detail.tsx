'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { api, type RouterOutputs } from '@/trpc/react';
import { useForm } from '@tanstack/react-form';
import { EllipsisVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
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

    const handleCandidateClick = () => {
        router.push(`/users/${candidate.candidateId}`);
    };

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex flex-col items-start gap-4 w-full border rounded border-gray-500 p-4">
                <div className="flex w-full">
                    <div
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={handleCandidateClick}
                    >
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
                                className="ml-auto hover:text-black"
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
                                className="text-red-500"
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
                        className="flex flex-col gap-2 mt-2 w-full"
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
                    candidate.comments && <p className="text-gray-500">{candidate.comments}</p>
                )}
            </div>
        </div>
    );
}
