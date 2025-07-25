'use client';

import { ArrayInput } from '@/components/array-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { createId } from '@paralleldrive/cuid2';
import { DialogOverlay, DialogPortal } from '@radix-ui/react-dialog';
import { skipToken } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Plus, PlusCircle, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';

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
    tags: [],
};

interface AdminCreateEditProjectProps {
    projectId?: string;
}

export default function AdminCreateEditProject(props: AdminCreateEditProjectProps) {
    const [dialogueOpen, setDialogueOpen] = useState<boolean>(false);
    const [formState, setFormState] = useState<CreateProjectFormSchema>(defaultForm);
    const [open, setOpen] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const createTag = api.projects.createTag.useMutation();
    const createProject = api.projects.create.useMutation();
    const tags = api.projects.getAllTags.useQuery();
    const editProject = api.projects.updateOne.useMutation();
    const getProject = api.projects.getOne.useQuery(props.projectId ? { id: props.projectId } : skipToken);
    const router = useRouter();

    useEffect(() => {
        if (!getProject.data) {
            return;
        }
        setFormState({
            title: getProject.data.title ?? '',
            subtitle: getProject.data.subtitle ?? '',
            description: getProject.data.description ?? '',
            requirements: (getProject.data.requirements ?? '').split('\n'),
            start: new Date(getProject.data.startDateTime ?? '').toISOString().split('.')[0]!,
            end: new Date(getProject.data.endDateTime ?? '').toISOString().split('.')[0]!,
            imageURL: getProject.data.imageURL ?? '',
            tags: getProject.data.tags?.map((t) => t.tag.name ?? 'Untitled Tag') ?? [],
        });
    }, [getProject.data]);

    async function onSubmit() {
        const title = formState.title.length > 0 ? formState.title : 'Untitled Project';
        const start = new Date(formState.start.length > 0 ? formState.start : Date.now());
        const end = new Date(formState.end.length > 0 ? formState.end : Date.now());
        const tagIds = tags.data?.filter((tag) => formState.tags.includes(tag.name ?? 'Untitled Tag')).map((tag) => tag.id);

        if (props.projectId) {
            const promise = editProject.mutateAsync({
                id: props.projectId,
                title: title,
                subtitle: formState.subtitle,
                description: formState.description,
                requirements: getReqsString(),
                imageURL: formState.imageURL,
                starts: start,
                ends: end,
                tags: tagIds ?? [],
            });
            toast.promise(promise, {
                loading: 'Updating project...',
                success: 'Project updated successfully!',
                error: 'Failed to update project.',
            });
            try {
                await promise;
                onDiscard();
                router.push(`/dashboard/projects/${props.projectId}`);
            } catch (err) {
                // error toast already handled by toast.promise
            }
        } else {
            const id = createId();
            const promise = createProject.mutateAsync({
                id: id,
                title: title,
                subtitle: formState.subtitle,
                description: formState.description,
                requirements: getReqsString(),
                imageURL: formState.imageURL,
                starts: start,
                ends: end,
                tags: tagIds,
            });
            toast.promise(promise, {
                loading: 'Creating project...',
                success: 'Project created successfully!',
                error: 'Failed to create project.',
            });
            try {
                await promise;
                onDiscard();
                router.push(`/dashboard/projects/${id}`);
            } catch (err) {
                // error toast already handled by toast.promise
            }
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
                asChild
            >
                <Button>
                    <PlusCircle /> {isNewProject ? 'Create Project' : 'Edit Project'}
                </Button>
            </DialogTrigger>
            <DialogPortal>
                <DialogOverlay />
                <DialogContent
                    className="w-screen max-h-2/3 min-w-3/5 overflow-y-scroll"
                    showCloseButton={false}
                >
                    <DialogHeader>
                        <div className="w-full flex justify-between">
                            <DialogTitle>{isNewProject ? 'Create New Project' : `Editing ${getProject.data?.title}`}</DialogTitle>
                            <DialogClose
                                className="hover:cursor-pointer"
                                onClick={() => {
                                    setDialogueOpen(false);
                                }}
                            >
                                <X />
                            </DialogClose>
                        </div>
                        <DialogDescription>{isNewProject ? 'Fill out the information needed to create a new project' : 'Make changes to the project'}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid w-full items-center gap-3">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            type="text"
                            id="title"
                            placeholder="Title"
                            autoFocus
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
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start">Starts At</Label>
                                <Input
                                    type="datetime-local"
                                    id="start"
                                    placeholder="Starts At"
                                    required
                                    value={formState.start}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormState({ ...formState, start: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end">Ends At</Label>
                                <Input
                                    type="datetime-local"
                                    id="end"
                                    placeholder="Ends At"
                                    required
                                    value={formState.end}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormState({ ...formState, end: e.target.value })}
                                />
                            </div>
                        </div>
                        <Label htmlFor="imageURL">Image</Label>
                        <Input
                            type="text"
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
                        <Label htmlFor="tags">Tags</Label>
                        <Popover
                            open={open}
                            onOpenChange={setOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    Select tags from dropdown
                                    <ChevronsUpDown className="opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[200px] p-0"
                                side="right"
                                align="start"
                            >
                                <Command>
                                    <CommandInput
                                        placeholder="Enter tag name"
                                        className="h-9"
                                        value={tagInput}
                                        onValueChange={setTagInput}
                                    />
                                    <CommandList>
                                        {tagInput.trim() !== '' && !tags.data?.some((tag) => tag.name?.toLowerCase() === tagInput.trim().toLowerCase()) && (
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-between whitespace-normal break-words"
                                                onClick={async () => {
                                                    const cleanInput = tagInput.trim();
                                                    const promise = createTag.mutateAsync({ name: cleanInput });
                                                    toast.promise(promise, {
                                                        loading: 'Creating tag...',
                                                        success: (data) => `Tag "${data?.name}" created successfully!`,
                                                        error: 'Failed to create tag.',
                                                    });
                                                    await promise;
                                                    if (!formState.tags.includes(cleanInput)) {
                                                        setFormState({
                                                            ...formState,
                                                            tags: [...formState.tags, cleanInput],
                                                        });
                                                    }
                                                    setTagInput('');
                                                    setOpen(false);
                                                    await tags.refetch();
                                                }}
                                            >
                                                Create &quot;{tagInput}&quot; tag <Plus />
                                            </Button>
                                        )}
                                        <CommandGroup>
                                            {tags.data?.map((tag) => (
                                                <CommandItem
                                                    key={tag.id}
                                                    value={tag.name ?? 'Untitled Tag'}
                                                    onSelect={(currentValue) => {
                                                        if (!formState.tags.includes(currentValue)) {
                                                            setFormState({
                                                                ...formState,
                                                                tags: [...formState.tags, currentValue],
                                                            });
                                                        } else {
                                                            setFormState({
                                                                ...formState,
                                                                tags: formState.tags.filter((t) => t !== currentValue),
                                                            });
                                                        }
                                                        setTagInput('');
                                                        console.log('Selected tags:', formState.tags);
                                                    }}
                                                >
                                                    {tag.name}
                                                    <Check className={cn('ml-auto', formState.tags.includes(tag.name ?? 'Untitled Tag') ? 'opacity-100' : 'opacity-0')} />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {formState.tags && formState.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 my-2">
                                {formState.tags.map((tagName) => {
                                    return (
                                        <Badge
                                            key={tagName}
                                            className="inline-flex items-center px-2 py-1 text-xs font-medium"
                                        >
                                            {tagName}
                                            <button
                                                className="ml-2 text-white hover:text-red-500"
                                                onClick={() => {
                                                    setFormState({
                                                        ...formState,
                                                        tags: formState.tags.filter((t) => t !== tagName),
                                                    });
                                                }}
                                            >
                                                <X className="h-3 w-3 hover:cursor-pointer" />
                                            </button>
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
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
