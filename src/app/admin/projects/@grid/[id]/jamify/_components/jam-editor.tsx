'use client';

import { Button } from '@/components/ui/button';
import { api, type RouterOutputs } from '@/trpc/react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { DndContext, DragOverlay, closestCenter, useDraggable, useDroppable } from '@dnd-kit/core';
import { ArrowRight, Eye, GripVertical, LoaderCircle, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    matches: {
        teams: string[][];
    };
    profiles: RouterOutputs['candidates']['getMany'];
    projectId: string;
}

function DraggableUser({ userId, profiles }: { userId: string; profiles: Props['profiles'] }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: userId,
    });

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              opacity: isDragging ? 0.5 : 1,
          }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-2 bg-white/40 backdrop-blur-lg rounded flex gap-2 items-center cursor-grab"
        >
            <GripVertical />
            <p className="font-bold">{profiles.find((p) => p.userId === userId)?.displayName}</p>
            <Eye className="ml-auto" />
        </div>
    );
}

function DroppableTeam({ teamIndex, team, profiles }: { teamIndex: number; team: string[]; profiles: Props['profiles'] }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `team-${teamIndex}`,
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-w-1/4 flex-1 rounded-lg p-4 space-y-2 transition-colors ${isOver ? 'bg-blue-600' : 'bg-blue-800'}`}
        >
            <h1>Team {String.fromCharCode(teamIndex + 65)}</h1>
            {team.map((userId) => (
                <DraggableUser
                    key={userId}
                    userId={userId}
                    profiles={profiles}
                />
            ))}
        </div>
    );
}

function NewTeamDropZone({ isActive }: { isActive: boolean }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'new-team',
    });

    if (!isActive) return null;

    return (
        <div
            ref={setNodeRef}
            className={`flex-shrink-0 w-48 h-full rounded border-2 border-dashed transition-colors flex items-center justify-center ${isOver ? 'border-green-400 bg-green-100/20' : 'border-gray-400'}`}
        >
            <p className="text-center text-gray-300 font-medium">
                <Plus />
            </p>
        </div>
    );
}

export function JamEditor(props: Props) {
    const [teams, setTeams] = useState<string[][]>(props.matches.teams);
    const [activeUser, setActiveUser] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const handleWindowClose = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = ''; // Needed for Chrome
        };

        const handleBrowseAway = (url: string) => {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
        };

        window.addEventListener('beforeunload', handleWindowClose);

        return () => {
            window.removeEventListener('beforeunload', handleWindowClose);
        };
    }, []);

    const createJams = api.projectInstances.createJams.useMutation({
        onSuccess: () => {
            router.push(`/admin/projects/${props.projectId}`);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleDragStart = (event: DragStartEvent) => {
        setActiveUser(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveUser(null);

        if (!over) return;

        const activeUserId = active.id as string;
        const overTeamId = over.id as string;

        // Find which team the user is currently in
        const sourceTeamIndex = teams.findIndex((team) => team.includes(activeUserId));
        if (sourceTeamIndex === -1) return;

        if (overTeamId === 'new-team') {
            // Create new team with this user
            setTeams((prevTeams) => {
                const newTeams = [...prevTeams];
                // Remove from source team
                const sourceTeam = newTeams[sourceTeamIndex];
                if (sourceTeam) {
                    newTeams[sourceTeamIndex] = sourceTeam.filter((id) => id !== activeUserId);
                }
                // Remove empty teams
                const filteredTeams = newTeams.filter((team) => team.length > 0);
                // Add new team with the user
                filteredTeams.push([activeUserId]);
                return filteredTeams;
            });
        } else {
            // Extract team index from the droppable id
            const overTeamIndex = parseInt(overTeamId.replace('team-', ''));
            if (isNaN(overTeamIndex) || sourceTeamIndex === overTeamIndex) return;

            // Move user from source team to target team
            setTeams((prevTeams) => {
                const newTeams = [...prevTeams];
                // Remove from source team
                const sourceTeam = newTeams[sourceTeamIndex];
                const targetTeam = newTeams[overTeamIndex];
                if (sourceTeam && targetTeam) {
                    newTeams[sourceTeamIndex] = sourceTeam.filter((id) => id !== activeUserId);
                    // Add to target team
                    newTeams[overTeamIndex] = [...targetTeam, activeUserId];
                }
                // Remove empty teams
                return newTeams.filter((team) => team.length > 0);
            });
        }
    };

    return (
        <>
            <DndContext
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 flex gap-2">
                    <div className="flex flex-wrap gap-2 w-full">
                        {teams.map((team, tIndex) => (
                            <DroppableTeam
                                key={tIndex}
                                teamIndex={tIndex}
                                team={team}
                                profiles={props.profiles}
                            />
                        ))}
                        <NewTeamDropZone isActive={!!activeUser} />
                    </div>
                </div>
                <DragOverlay>
                    {activeUser ? (
                        <div className="p-2 bg-white/40 backdrop-blur-lg rounded flex gap-2 items-center cursor-grab">
                            <GripVertical />
                            <p className="font-bold">{props.profiles.find((p) => p.userId === activeUser)?.displayName}</p>
                            <Eye className="ml-auto" />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
            <Button
                onClick={() => {
                    createJams.mutate({
                        projectId: props.projectId,
                        teams: teams,
                    });
                }}
                disabled={createJams.isPending || teams.length === 0 || teams.some((team) => team.length === 0)}
            >
                {createJams.isPending ? (
                    <LoaderCircle className="animate-spin" />
                ) : (
                    <>
                        Create Jams <ArrowRight />
                    </>
                )}
            </Button>
        </>
    );
}
