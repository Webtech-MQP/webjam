'use client';

import { Button } from '@/components/ui/button';
import type { RouterOutputs } from '@/trpc/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EyeIcon, EyeOffIcon, GripVertical } from 'lucide-react';
import Image from 'next/image';

type CandidateAward = RouterOutputs['awards']['getUserAwards'][number];

interface SortableAwardItemProps {
    award: CandidateAward;
    onToggleVisibility: () => void;
}

export function SortableAwardItem({ award, onToggleVisibility }: SortableAwardItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: award.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 rounded-lg border border-gray-800 bg-stone-950 p-2 ${!award.isVisible ? 'opacity-50' : ''}`}
        >
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
            >
                <GripVertical className="h-5 w-5 text-gray-500" />
            </button>

            <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-700">
                <Image
                    src={award.award.imageURL}
                    alt={award.award.title}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                />
            </div>

            <span className="flex-1 text-sm font-medium">{award.award.title}</span>

            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility();
                }}
                className="h-8 w-8"
            >
                {!award.isVisible ? <EyeOffIcon className="h-4 w-4 text-gray-500" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
        </div>
    );
}
