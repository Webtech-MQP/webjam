'use client';

import { api } from '@/trpc/react';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { SortableAwardItem } from './sortable-award-item';

interface AwardEditorProps {
    userId: string;
    className?: string;
}

export interface AwardEditorHandle {
    hasChanges: boolean;
    saveChanges: () => Promise<void>;
}

export const AwardEditor = forwardRef<AwardEditorHandle, AwardEditorProps>(({ userId, className = '' }, ref) => {
    const utils = api.useUtils();
    const { data } = api.awards.getUserAwards.useQuery({ userId: userId }, { enabled: !!userId });
    const initialAwards = data ?? [];

    const [awards, setAwards] = useState(initialAwards);
    const [hasChanges, setHasChanges] = useState(false);

    const updateVisibility = api.awards.updateAwardVisibilities.useMutation();
    const updateOrder = api.awards.updateAwardOrder.useMutation();

    useEffect(() => {
        if (data) {
            setAwards(data);
            setHasChanges(false);
        }
    }, [data]);

    const handleVisibilityToggle = (id: string) => {
        setAwards((prev) => prev.map((award) => (award.id === id ? { ...award, isVisible: !award.isVisible } : award)));
        setHasChanges(true);
    };

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setAwards((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            if (oldIndex < 0 || newIndex < 0) return items;

            const sorted = arrayMove(items, oldIndex, newIndex);
            setHasChanges(true);
            return sorted;
        });
    };

    const saveChanges = async () => {
        if (!hasChanges) return;

        try {
            await updateOrder.mutateAsync({
                orders: awards.map((award, index) => ({
                    id: award.id,
                    displayOrder: index,
                })),
            });

            await updateVisibility.mutateAsync({
                updates: awards.map((award) => ({
                    id: award.id,
                    isVisible: award.isVisible ?? false,
                })),
            });

            await utils.awards.getUserAwards.invalidate({ userId: userId });
            setHasChanges(false);
        } catch (error) {
            console.error('Error saving award changes:', error);
            throw error;
        }
    };

    useImperativeHandle(ref, () => ({
        hasChanges,
        saveChanges,
    }));

    if (awards.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <h3 className="text-sm font-medium uppercase tracking-wide text-gray-400">Edit Awards</h3>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={awards.map((award) => award.id)}>
                    <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
                        {awards.map((award) => (
                            <SortableAwardItem
                                key={award.id}
                                award={award}
                                onToggleVisibility={() => handleVisibilityToggle(award.id)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
});

AwardEditor.displayName = 'AwardEditor';
