'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageUpload } from '@/components/ui/image-uploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RouterOutputs } from '@/trpc/react';
import { api } from '@/trpc/react';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Award {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string;
}

interface ProjectAwardsSectionProps {
    projectId?: string;
    defaultAwards?: Award[];
}

export default function ProjectAwardsSection({ projectId, defaultAwards = [] }: ProjectAwardsSectionProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedAwards, setSelectedAwards] = useState<Award[]>(defaultAwards);
    const [newAward, setNewAward] = useState({
        title: '',
        description: '',
        imageUrl: '',
    });

    const allAwards = api.awards.getAll.useQuery();
    const createAward = api.awards.createAward.useMutation();
    const connectAwards = api.projects.updateProjectAwards.useMutation();
    const projectAwards = api.projects.getProjectAwards.useQuery({ projectId: projectId ?? '' }, { enabled: !!projectId });

    const transformAward = (a: RouterOutputs['awards']['getAll'][number]): Award => {
        return {
            id: a.id,
            title: a.title,
            description: a.description,
            imageUrl: a.imageUrl,
        };
    };

    useEffect(() => {
        if (projectAwards.data) {
            const validAwards = projectAwards.data.map(transformAward);
            setSelectedAwards(validAwards);
        }
    }, [projectAwards.data]);

    const availableAwards = allAwards.data?.map(transformAward).filter((a) => !selectedAwards.some((sa) => sa.id === a.id)) ?? [];

    const addAward = (award: Award) => {
        setSelectedAwards((prev) => [...prev, award]);
    };

    const removeAward = (awardId: string) => {
        setSelectedAwards((prev) => prev.filter((a) => a.id !== awardId));
    };

    const onSave = async () => {
        if (!projectId) return;

        const promise = connectAwards.mutateAsync({
            projectId,
            awardIds: selectedAwards.map((a) => a.id),
        });

        toast.promise(promise, {
            loading: 'Updating project awards...',
            success: 'Project awards updated!',
            error: 'Failed to update project awards.',
        });

        try {
            await promise;
            setDialogOpen(false);
        } catch {
            // Error handled by toast
        }
    };

    const onCreateAward = async () => {
        if (!newAward.title.trim()) {
            toast.error('Award title is required');
            return;
        }

        const promise = createAward.mutateAsync({
            title: newAward.title.trim(),
            description: newAward.description.trim() || undefined,
            imageUrl: newAward.imageUrl || '',
        });

        toast.promise(promise, {
            loading: 'Creating award...',
            success: 'Award created successfully!',
            error: 'Failed to create award.',
        });

        try {
            await promise;
            setNewAward({ title: '', description: '', imageUrl: '' });
            setCreateDialogOpen(false);
            await allAwards.refetch();
        } catch {
            // Error handled by toast
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Project Awards</Label>
                <Dialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Manage Awards
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Manage Project Awards</DialogTitle>
                            <DialogDescription>Add or remove awards that can be given to participants in this project.</DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6">
                            <div className="flex justify-end">
                                <Dialog
                                    open={createDialogOpen}
                                    onOpenChange={setCreateDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create New Award
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create New Award</DialogTitle>
                                            <DialogDescription>Create a new award that can be given to participants.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="award-title">Title</Label>
                                                <Input
                                                    id="award-title"
                                                    placeholder="Award title"
                                                    value={newAward.title}
                                                    onChange={(e) => setNewAward((prev) => ({ ...prev, title: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="award-description">Description</Label>
                                                <Textarea
                                                    id="award-description"
                                                    placeholder="Award description (optional)"
                                                    value={newAward.description}
                                                    onChange={(e) => setNewAward((prev) => ({ ...prev, description: e.target.value }))}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="award-image">Award Image</Label>
                                                <ImageUpload
                                                    currentImageUrl={newAward.imageUrl || undefined}
                                                    uploadType="award"
                                                    onImageChange={(imageUrl) => setNewAward((prev) => ({ ...prev, imageUrl: imageUrl || '' }))}
                                                    className="w-32 h-32 box-content rounded-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCreateDialogOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={onCreateAward}
                                                disabled={createAward.isPending}
                                            >
                                                Create Award
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Selected Awards</h4>
                                <div className="rounded-lg border max-h-[220px] overflow-y-auto">
                                    {selectedAwards.map((award) => (
                                        <div
                                            key={award.id}
                                            className="flex items-center justify-between p-4 hover:bg-accent"
                                        >
                                            <div className="flex items-center gap-4">
                                                {award.imageUrl && (
                                                    <img
                                                        src={award.imageUrl}
                                                        alt={award.title}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{award.title}</p>
                                                    {award.description && <p className="text-sm text-muted-foreground dark:text-muted-foreground">{award.description}</p>}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeAward(award.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {selectedAwards.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground dark:text-muted-foreground">No awards selected</div>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Available Awards</h4>
                                <div className="rounded-lg border max-h-[220px] overflow-y-auto">
                                    {availableAwards.map((award) => (
                                        <div
                                            key={award.id}
                                            className="flex items-center justify-between p-4 hover:bg-accent"
                                        >
                                            <div className="flex items-center gap-4">
                                                {award.imageUrl && (
                                                    <img
                                                        src={award.imageUrl}
                                                        alt={award.title}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{award.title}</p>
                                                    {award.description && <p className="text-sm text-muted-foreground dark:text-muted-foreground">{award.description}</p>}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => addAward(award)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {availableAwards.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground dark:text-muted-foreground">No available awards</div>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onSave}
                                disabled={!projectId || connectAwards.isPending}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-lg border">
                {selectedAwards.map((award) => (
                    <div
                        key={award.id}
                        className="flex items-center gap-4 p-4"
                    >
                        {award.imageUrl && (
                            <img
                                src={award.imageUrl}
                                alt={award.title}
                                className="w-8 h-8 object-cover rounded"
                            />
                        )}
                        <div>
                            <p className="text-sm font-medium">{award.title}</p>
                            {award.description && <p className="text-sm text-muted-foreground dark:text-muted-foreground">{award.description}</p>}
                        </div>
                    </div>
                ))}
                {selectedAwards.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground dark:text-muted-foreground">No awards set up yet</div>}
            </div>
        </div>
    );
}
