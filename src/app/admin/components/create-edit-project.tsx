'use client';

import { ArrayInput } from '@/components/array-input';
import { ProjectAwardsInput } from '@/components/project-awards-input';
import { ProjectEventInput, type ProjectEvent } from '@/components/project-event-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-uploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { createId } from '@paralleldrive/cuid2';
import { useForm } from '@tanstack/react-form';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { JudgingCriteriaInput, type JudgingCriterion } from '../../../components/judging-criteria-input';
import ProjectRegistrationSection from './ProjectRegistrationSection';

const defaultForm = z.object({
    title: z.string().min(1, 'Title should be longer than 1 character.'),
    subtitle: z.string().min(1, 'Subtitle should be longer than 1 character.'),
    description: z.string(),
    requirements: z.array(z.string()),
    startDateTime: z.string().min(1, 'Must input a date.'),
    endDateTime: z.string().min(1, 'Must input a date.'),
    imageUrl: z.union([z.url(), z.literal('')]),
    tags: z.array(z.string()),
    judgingCriteria: z
        .array(
            z.object({
                criterion: z.string(),
                weight: z.number(),
            })
        )
        .refine(
            (criteria) => {
                if (criteria.length === 0) return true; // Allow empty criteria
                const totalWeight = criteria.reduce((sum, item) => sum + item.weight, 0);
                return totalWeight === 100;
            },
            {
                message: 'Judging criteria weights must total exactly 100%',
            }
        ),
    events: z.array(
        z.object({
            startTime: z.date(),
            endTime: z.date(),
            title: z.string(),
            isHeader: z.boolean(),
        })
    ),
    awards: z.array(z.string()),
});

const transformToUpload = defaultForm.transform((data) => ({
    ...data,
    requirements: data.requirements.join('\n'),
    starts: new Date(data.startDateTime),
    ends: new Date(data.endDateTime),
    judgingCriteria: data.judgingCriteria,
    events: data.events,
}));

export type InitialValuesType = z.input<typeof defaultForm>;
export type CreateProjectFormSchema = z.infer<typeof defaultForm>;

interface AdminCreateEditProjectProps {
    projectId?: string;
    initialData?: InitialValuesType;
}

export default function AdminCreateEditProject(props: AdminCreateEditProjectProps) {
    const initialData: z.input<typeof defaultForm> = props.initialData
        ? {
              ...props.initialData,
              startDateTime: formatInitialDate(props.initialData.startDateTime),
              endDateTime: formatInitialDate(props.initialData.endDateTime),
          }
        : {
              title: '',
              subtitle: '',
              description: '',
              requirements: [],
              startDateTime: '',
              endDateTime: '',
              imageUrl: '',
              tags: [],
              judgingCriteria: [],
              events: [],
              awards: [],
          };

    const [open, setOpen] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [isCreateAwardOpen, setIsCreateAwardOpen] = useState(false);
    const [newAward, setNewAward] = useState({
        title: '',
        description: '',
        imageUrl: '',
    });

    const createTag = api.projects.createTag.useMutation();
    const createProject = api.projects.create.useMutation();
    const tags = api.projects.getAllTags.useQuery();
    const editProject = api.projects.updateOne.useMutation();
    const availableAwards = api.awards.getAll.useQuery();
    const createAward = api.awards.createAward.useMutation();
    const deleteAward = api.awards.deleteAward.useMutation();

    const form = useForm({
        defaultValues: initialData,
        onSubmit: async ({ value }) => {
            const tagIds = tags.data?.filter((tag) => value.tags.includes(tag.name ?? 'Untitled Tag')).map((tag) => tag.id);

            if (props.projectId) {
                const promise = editProject.mutateAsync({
                    id: props.projectId,
                    ...transformToUpload.parse(value),
                    tags: tagIds ?? [],
                });
                toast.promise(promise, {
                    loading: 'Updating project...',
                    success: 'Project updated successfully!',
                    error: 'Failed to update project.',
                });
            } else {
                const id = createId();
                const promise = createProject.mutateAsync({
                    id: id,
                    ...transformToUpload.parse(value),
                    tags: tagIds,
                });
                toast.promise(promise, {
                    loading: 'Creating project...',
                    success: 'Project created successfully!',
                    error: 'Failed to create project.',
                });
            }
        },
        validators: {
            onChange: defaultForm,
        },
    });

    function onDiscard() {
        form.reset();
    }

    const isNewProject = props.projectId === undefined;

    return (
        <div className="grid w-full items-center gap-3">
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await form.handleSubmit();
                }}
            >
                <div className="grid w-full items-center gap-3">
                    <form.Field name="imageUrl">
                        {(field) => (
                            <ImageUpload
                                currentImageUrl={field.state.value || undefined}
                                uploadType="project"
                                onImageChange={(imageUrl) => field.handleChange(imageUrl || '')}
                                className={'w-40 h-40 box-content rounded-sm'}
                                disabled={editProject.isPending}
                            />
                        )}
                    </form.Field>
                    <form.Field name="title">
                        {(field) => (
                            <>
                                <Label htmlFor={field.name}>Title</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                            </>
                        )}
                    </form.Field>
                    <form.Field name="subtitle">
                        {(field) => (
                            <>
                                <Label htmlFor={field.name}>Subtitle</Label>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                            </>
                        )}
                    </form.Field>
                    <form.Field name="description">
                        {(field) => (
                            <>
                                <Label htmlFor={field.name}>Description</Label>
                                <Textarea
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                            </>
                        )}
                    </form.Field>
                    <form.Field name="requirements">
                        {(field) => (
                            <>
                                <ArrayInput
                                    title="Requirements"
                                    decoration="numbers-dot"
                                    allowCreate
                                    allowDelete
                                    onChange={(v) => field.handleChange(v as string[])}
                                    list={field.state.value}
                                />
                                {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                            </>
                        )}
                    </form.Field>
                    <div className="grid grid-cols-2 gap-4">
                        <form.Field name="startDateTime">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Starts At</Label>
                                    <Input
                                        type="datetime-local"
                                        id={field.name}
                                        name={field.name}
                                        placeholder="Starts At"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                                </div>
                            )}
                        </form.Field>
                        <form.Field name="endDateTime">
                            {(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor={field.name}>Ends At</Label>
                                    <Input
                                        type="datetime-local"
                                        id={field.name}
                                        name={field.name}
                                        placeholder="Ends At"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                                </div>
                            )}
                        </form.Field>
                    </div>
                    <form.Field name="events">
                        {(field) => (
                            <div>
                                <ProjectEventInput
                                    title="Project Timeline Events"
                                    allowCreate
                                    allowDelete
                                    onChange={(v: ProjectEvent[]) => field.handleChange(v)}
                                    list={field.state.value}
                                />
                                {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                            </div>
                        )}
                    </form.Field>
                    <form.Field name="tags">
                        {(field) => (
                            <>
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
                                                            if (!field.state.value.includes(cleanInput)) {
                                                                field.handleChange([...field.state.value, cleanInput]);
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
                                                                if (!field.state.value.includes(currentValue)) {
                                                                    field.handleChange([...field.state.value, currentValue]);
                                                                } else {
                                                                    field.handleChange(field.state.value.filter((t) => t !== currentValue));
                                                                }
                                                                setTagInput('');
                                                                console.log('Selected tags:', field.state.value);
                                                            }}
                                                        >
                                                            {tag.name}
                                                            <Check className={cn('ml-auto', field.state.value.includes(tag.name ?? 'Untitled Tag') ? 'opacity-100' : 'opacity-0')} />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {field.state.value && field.state.value.length > 0 && (
                                    <div className="flex flex-wrap gap-2 my-2">
                                        {field.state.value.map((tagName) => {
                                            return (
                                                <Badge
                                                    key={tagName}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium"
                                                >
                                                    {tagName}
                                                    <button
                                                        className="ml-2 text-white hover:text-red-500"
                                                        onClick={() => {
                                                            field.handleChange(field.state.value.filter((t) => t !== tagName));
                                                        }}
                                                    >
                                                        <X className="h-3 w-3 hover:cursor-pointer" />
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                )}
                                {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                            </>
                        )}
                    </form.Field>
                    <form.Field name="judgingCriteria">
                        {(field) => (
                            <div>
                                <JudgingCriteriaInput
                                    title="Judging Criteria"
                                    allowCreate
                                    allowDelete
                                    onChange={(v: JudgingCriterion[]) => field.handleChange(v)}
                                    list={field.state.value}
                                />
                                {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                            </div>
                        )}
                    </form.Field>
                    <form.Field name="awards">
                        {(field) => (
                            <>
                                <ProjectAwardsInput
                                    awards={availableAwards.data || []}
                                    projectAwards={field.state.value}
                                    onAwardToggle={(awardId) => {
                                        const newValue = field.state.value.includes(awardId) ? field.state.value.filter((id) => id !== awardId) : [...field.state.value, awardId];
                                        field.handleChange(newValue);
                                    }}
                                    onCreateAward={() => setIsCreateAwardOpen(true)}
                                    onDeleteAward={(awardId) => {
                                        const promise = deleteAward.mutateAsync({ awardId });
                                        toast.promise(promise, {
                                            loading: 'Deleting award...',
                                            success: () => {
                                                if (field.state.value.includes(awardId)) {
                                                    field.handleChange(field.state.value.filter(id => id !== awardId));
                                                }
                                                void availableAwards.refetch();
                                                return 'Award deleted successfully!';
                                            },
                                            error: 'Failed to delete award',
                                        });
                                    }}
                                    allowEdit={true}
                                />

                                <Dialog
                                    open={isCreateAwardOpen}
                                    onOpenChange={setIsCreateAwardOpen}
                                >
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create New Award</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="mx-auto">
                                                <ImageUpload
                                                    currentImageUrl={newAward.imageUrl}
                                                    uploadType="award"
                                                    onImageChange={(imageUrl) => setNewAward((prev) => ({ ...prev, imageUrl: imageUrl || '' }))}
                                                    className="w-40 h-40 rounded-md"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="title">Title</Label>
                                                <Input
                                                    id="title"
                                                    value={newAward.title}
                                                    onChange={(e) => setNewAward((prev) => ({ ...prev, title: e.target.value }))}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={newAward.description}
                                                    onChange={(e) => setNewAward((prev) => ({ ...prev, description: e.target.value }))}
                                                />
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setIsCreateAwardOpen(false);
                                                        setNewAward({ title: '', description: '', imageUrl: '' });
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (!newAward.title || !newAward.imageUrl) {
                                                            toast.error('Title and image are required');
                                                            return;
                                                        }

                                                        const promise = createAward.mutateAsync({
                                                            title: newAward.title,
                                                            description: newAward.description,
                                                            imageUrl: newAward.imageUrl,
                                                        });

                                                        toast.promise(promise, {
                                                            loading: 'Creating award...',
                                                            success: () => {
                                                                setIsCreateAwardOpen(false);
                                                                setNewAward({ title: '', description: '', imageUrl: '' });
                                                                void availableAwards.refetch();
                                                                return 'Award created successfully!';
                                                            },
                                                            error: 'Failed to create award',
                                                        });
                                                    }}
                                                    disabled={createAward.isPending}
                                                >
                                                    Create Award
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                    </form.Field>
                    <ProjectRegistrationSection projectId={props.projectId} />
                    <form.Subscribe selector={(state) => [state.isPristine]}>
                        {([isPristine]) => (
                            <Button
                                disabled={isPristine}
                                type="submit"
                            >
                                {isNewProject ? 'Create' : 'Save Changes'}
                            </Button>
                        )}
                    </form.Subscribe>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onDiscard}
                    >
                        Discard
                    </Button>
                </div>
            </form>
        </div>
    );
}

function isValidHttpUrl(str: string) {
    let url;

    try {
        url = new URL(str);
    } catch {
        return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
}

/**
 *
 * @param date Date object.
 * @returns String formatted for datetime-local input.
 */
function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Helper function to format initial date values for datetime-local inputs
 */
function formatInitialDate(value: unknown): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (value instanceof Date) return formatDateForInput(value);
    return '';
}
