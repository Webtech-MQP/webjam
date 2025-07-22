'use client';

import { ArrayInput } from '@/components/array-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { createId } from '@paralleldrive/cuid2';
import { DialogOverlay, DialogPortal } from '@radix-ui/react-dialog';
import { Check, ChevronsUpDown, Plus, PlusCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent } from 'react';
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

export default function AdminCreateProject() {
    const [dialogueOpen, setDialogueOpen] = useState<boolean>(false);
    const [formState, setFormState] = useState<CreateProjectFormSchema>(defaultForm);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [formTags, setFormTags] = useState<string[]>([]);
    const createTag = api.projects.createTag.useMutation();
    const createProject = api.projects.create.useMutation();
    const tags = api.projects.getAllTags.useQuery();
    const router = useRouter();

    async function onSubmit() {
        const id = createId();
        const title = formState.title.length > 0 ? formState.title : 'Untitled Project';
        const start = new Date(formState.start.length > 0 ? formState.start : Date.now());
        const end = new Date(formState.end.length > 0 ? formState.end : Date.now());
        console.log(end);

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

    function onDiscard() {
        setDialogueOpen(false);
        setFormState(defaultForm);
    }

    function getReqsString() {
        if (!formState.requirements || formState.requirements.length === 0) {
            return '';
        }
        return 'Requirements:\n' + formState.requirements.map((req) => '• ' + req).join('\n');
    }

    return (
        <Dialog open={dialogueOpen}>
            <DialogTrigger
                onClick={() => {
                    setDialogueOpen(true);
                }}
                asChild
            >
                <Button>
                    <PlusCircle /> Create Project
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
                            <DialogTitle>Create New Project</DialogTitle>
                            <DialogClose
                                onClick={() => {
                                    setDialogueOpen(false);
                                }}
                            >
                                <X />
                            </DialogClose>
                        </div>
                        <DialogDescription>Fill out the information needed to create a new project.</DialogDescription>
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
                            defaultValues={formState.requirements}
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
                            type="file"
                            id="imageURL"
                            placeholder="Image URL"
                            value={formState.imageURL}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormState({ ...formState, imageURL: e.target.value })}
                        />
                        {/* {formState.imageURL.trim().length > 0 && isValidHttpUrl(formState.imageURL.trim()) && (
                            <Image
                                src={formState.imageURL.trim()}
                                alt="Image"
                                width={100}
                                height={100}
                                className="object-cover"
                            />
                        )} */}
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
                                    {value ? tags.data?.find((tag) => tag.name === value)?.name : 'Select a tag'}
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
                                        {(!tags.data || !tags.data.some((tag) => tag.name === tagInput)) && tagInput.trim() !== '' ? (
                                            <CommandEmpty className="m-1">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-between"
                                                    onClick={async () => {
                                                        const promise = createTag.mutateAsync({ name: tagInput });
                                                        toast.promise(promise, {
                                                            loading: 'Creating tag...',
                                                            success: (data) => {
                                                                return `Tag "${data?.name}" created successfully!`;
                                                            },
                                                            error: 'Failed to create tag.',
                                                        });
                                                        const data = await promise;
                                                        if (typeof data === 'object' && data !== null && 'name' in data) {
                                                            // setValue(data.name);
                                                        } else {
                                                            setValue(tagInput);
                                                        }
                                                        setTagInput('');
                                                        tags.refetch();
                                                    }}
                                                >
                                                    Create "{tagInput}" tag <Plus />
                                                </Button>
                                            </CommandEmpty>
                                        ) : null}
                                        <CommandGroup>
                                            {tags.data?.map((tag) => (
                                                <CommandItem
                                                    key={tag.id}
                                                    value={tag.name ?? ''}
                                                    onSelect={(currentValue) => {
                                                        setValue(currentValue === value ? '' : currentValue);
                                                        if (!formTags.includes(currentValue)) {
                                                            setFormTags([...formTags, currentValue]);
                                                            setFormState({
                                                                ...formState,
                                                                tags: [...formTags, currentValue],
                                                            });
                                                        }
                                                    }}
                                                >
                                                    {tag.name}
                                                    <Check className={cn('ml-auto', value === tag.id ? 'opacity-100' : 'opacity-0')} />
                                                </CommandItem>
                                            ))}
                                            <CommandItem
                                                onSelect={() => {
                                                    setTagInput('');
                                                }}
                                            >
                                                Create "{tagInput}" tag <Plus />
                                            </CommandItem>
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {formState.tags && formState.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 my-2">
                                {formState.tags.map((tag, index) => (
                                    <Badge
                                        key={tag + index}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium"
                                    >
                                        {tag}
                                        <button
                                            className="ml-2 text-white hover:text-red-500"
                                            onClick={() => {
                                                setFormState({
                                                    ...formState,
                                                    tags: formState.tags.filter((t) => t !== tag),
                                                });
                                            }}
                                        >
                                            <X className="h-3 w-3 hover:cursor-pointer" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <Button onClick={onSubmit}>Create</Button>
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
