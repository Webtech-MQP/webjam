'use client';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MessyButton } from './messy-button';
import { ProjectDetail } from './project-detail';
import { Dialog, DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from './ui/dialog';

interface ProjectModalProps {
    id: string;
}

export function ProjectModal(props: ProjectModalProps) {
    const router = useRouter();

    return (
        <Dialog
            open={true}
            onOpenChange={(o) => {
                if (!o) router.back();
            }}
        >
            <DialogPortal>
                <DialogOverlay />
                <DialogContent
                    showCloseButton={false}
                    className="max-h-2/3 w-screen min-w-3/5 overflow-y-scroll"
                >
                    <VisuallyHidden>
                        <DialogTitle>Hidden</DialogTitle>
                    </VisuallyHidden>
                    <div className="relative">
                        <ProjectDetail id={props.id} />
                        <DialogClose asChild>
                            <MessyButton className="absolute top-2 right-2">
                                <X />
                            </MessyButton>
                        </DialogClose>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
