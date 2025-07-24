'use client';

import { ArrayInput } from '@/components/array-input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/trpc/react';
import { createId } from '@paralleldrive/cuid2';
import { DialogOverlay, DialogPortal } from '@radix-ui/react-dialog';
import { skipToken } from '@tanstack/react-query';
import { PlusCircle, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ChangeEvent } from 'react';

interface CreateProjectFormSchema {
    title: string;
    subtitle: string;
    description: string;
    requirements: string[];
    start: string;
    end: string;
    imageURL: string;
    tags: string[];
}

const defaultForm: CreateProjectFormSchema = {
    title: '',
    subtitle: '',
    description: '',
    requirements: [''],
    start: '',
    end: '',
    imageURL: '',
    tags: [''],
};

interface AdminCreateEditProjectProps {
    projectId?: string;
}

export default function AdminCreateEditProject(props: AdminCreateEditProjectProps) {
    const [dialogueOpen, setDialogueOpen] = useState<boolean>(false);
    const [formState, setFormState] = useState<CreateProjectFormSchema>(defaultForm);
    const createProject = api.projects.create.useMutation();
    const editProject = api.projects.updateOne.useMutation();
    const getProject = api.projects.getOne.useQuery(props.projectId ? { id: props.projectId } : skipToken);
    const router = useRouter();

    useEffect(() => {
        if (!getProject.data) {
            return;
        }
        setFormState({
            title: getProject.data.title ?? '',
            subtitle: getProject.data.subTitle ?? '',
            description: getProject.data.description ?? '',
            requirements: (getProject.data.requirements ?? '').split('\n'),
            start: new Date(getProject.data.startDateTime ?? '').toISOString().split('.')[0]!,
            end: new Date(getProject.data.endDateTime ?? '').toISOString().split('.')[0]!,
            imageURL: getProject.data.imageURL ?? '',
            tags: [''], //TODO implement tag handling
        });
    }, [getProject.data]);

    async function onSubmit() {
        const title = formState.title.length > 0 ? formState.title : 'Untitled Project';
        const start = new Date(formState.start.length > 0 ? formState.start : Date.now());
        const end = new Date(formState.end.length > 0 ? formState.end : Date.now());
        console.log(formState.start);
        if (props.projectId) {
            await editProject.mutateAsync({
                id: props.projectId,
                title: title,
                subtitle: formState.subtitle,
                description: formState.description,
                requirements: getReqsString(),
                imageURL: formState.imageURL,
                starts: start,
                ends: end,
            });
            onDiscard();
            router.push(`/dashboard/projects/${props.projectId}`);
        } else {
            const id = createId();
            await createProject.mutateAsync({
                id: id,
                title: title,
                subtitle: formState.subtitle,
                description: formState.description,
                requirements: getReqsString(),
                imageURL: formState.imageURL,
                starts: start,
                ends: end,
            });
            onDiscard();
            router.push(`/dashboard/projects/${id}`);
        }
    }

    function onDiscard() {
        setDialogueOpen(false);
        if (!props.projectId) {
            setFormState(defaultForm);
        }
    }

    function getReqsString() {
        if (!formState.requirements || formState.requirements.length === 0) {
            return '';
        }
        return formState.requirements.join('\n');
    }

    const isNewProject = props.projectId === undefined;

    return (
        <Dialog open={dialogueOpen}>
            <DialogTrigger
                onClick={() => {
                    setDialogueOpen(true);
                }}
            >
                <PlusCircle /> {isNewProject ? 'Create Project' : 'Edit Project'}
            </DialogTrigger>
            <DialogPortal>
                <DialogOverlay />
                <DialogContent
                    className="h-full overflow-y-scroll"
                    showCloseButton={false}
                >
                    <DialogHeader>
                        <div className="w-full flex justify-between">
                            <DialogTitle>{isNewProject ? 'Create New Project' : `Editing ${getProject.data?.title}`}</DialogTitle>
                            <DialogClose
                                onClick={() => {
                                    setDialogueOpen(false);
                                }}
                            >
                                <X />
                            </DialogClose>
                        </div>
                        <DialogDescription>{isNewProject ? 'Fill out the information needed to create a new project' : 'Make changes to the project'}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid w-full max-w-sm items-center gap-3">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            type="text"
                            id="title"
                            placeholder="Title"
                            required
                            minLength={1}
                            value={formState.title}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormState({ ...formState, title: e.target.value })}
                        />
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Input
                            type="text"
                            id="subtitle"
                            placeholder="Subtitle"
                            value={formState.subtitle}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormState({ ...formState, subtitle: e.target.value })}
                        />
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Description"
                            value={formState.description}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormState({ ...formState, description: e.target.value })}
                        />
                        <ArrayInput
                            title="Requirements"
                            decoration="numbers-dot"
                            allowCreate
                            allowDelete
                            onChange={(v) => setFormState({ ...formState, requirements: v as string[] })}
                            list={formState.requirements}
                        />
                        <Label htmlFor="start">Starts At</Label>
                        <Input
                            type="datetime-local"
                            id="start"
                            placeholder="Starts At"
                            required
                            value={formState.start}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormState({ ...formState, start: e.target.value })}
                        />
                        <Label htmlFor="end">Ends At</Label>
                        <Input
                            type="datetime-local"
                            id="end"
                            placeholder="Ends At"
                            required
                            value={formState.end}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormState({ ...formState, end: e.target.value })}
                        />
                        <Label htmlFor="imageURL">Image URL</Label>
                        <Input
                            type="url"
                            id="imageURL"
                            placeholder="Image URL"
                            value={formState.imageURL}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormState({ ...formState, imageURL: e.target.value })}
                        />
                        {formState.imageURL.trim().length > 0 && isValidHttpUrl(formState.imageURL.trim()) && (
                            <Image
                                src={formState.imageURL.trim()}
                                alt="Image"
                                width={100}
                                height={100}
                                className="object-cover"
                            />
                        )}
                        <ArrayInput
                            title="Tags"
                            decoration="bullets"
                            allowCreate
                            allowDelete
                            onChange={(v) => setFormState({ ...formState, tags: v as string[] })}
                            list={formState.tags}
                        />
                        <Button onClick={onSubmit}>{isNewProject ? 'Create' : 'Save Changes'}</Button>
                        <Button
                            variant="secondary"
                            onClick={onDiscard}
                        >
                            Discard
                        </Button>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}

function isValidHttpUrl(str: string) {
    let url;

    try {
        url = new URL(str);
    } catch (_) {
        return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
}
