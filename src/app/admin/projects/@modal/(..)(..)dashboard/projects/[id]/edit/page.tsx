'use client';

import AdminCreateEditProject from '@/app/admin/components/create-edit-project';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function CreateEditProject(props: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(props.params);

    return (
        <Dialog open={true}>
            <DialogPortal>
                <DialogOverlay />
                <DialogContent
                    className="w-screen max-h-2/3 min-w-3/5 overflow-y-scroll"
                    showCloseButton={false}
                >
                    <DialogHeader>
                        <div className="w-full flex justify-between">
                            <DialogTitle>{id ? 'Editing Project' : 'Create New Project'}</DialogTitle>
                            <DialogClose
                                className="hover:cursor-pointer"
                                onClick={() => {
                                    router.back();
                                }}
                            >
                                <X />
                            </DialogClose>
                        </div>
                        <DialogDescription>{id ? 'Fill out the information needed to create a new project' : 'Make changes to the project'}.</DialogDescription>
                    </DialogHeader>
                    <AdminCreateEditProject projectId={id} />
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
