'use client';

import { AwardEditor, type AwardEditorHandle } from '@/components/awards/awards-display-editor';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-uploader';
import { Input } from '@/features/profiles/editor/input';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useForm } from '@tanstack/react-form';
import { EyeIcon, EyeOffIcon, HandIcon, LoaderCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import z from 'zod';

const formSchema = z.object({
    displayName: z.string(),
    publicEmail: z.email(),
    bio: z.string(),
    location: z.string(),
    linkedinURL: z.url({ hostname: /^(www.)?linkedin.com$/, protocol: /^https$/ }).or(z.string().length(0)),
    imageUrl: z.url(),
    bannerUrl: z.string(),
});

export default function Page() {
    const { userId: encodedUserId } = useParams();

    const utils = api.useUtils();

    const router = useRouter();

    const userId = decodeURIComponent(encodedUserId as string);

    const session = useSession();

    const updateCandidate = api.candidates.updateMe.useMutation({
        onSuccess: () => {
            router.push(`/users/${userId}`);
            // What in the eslint
            void utils.candidates.getOne.invalidate({ id: userId });
        },
    });

    const changeProjectVisibility = api.candidates.changeProjectVisibility.useMutation({
        onMutate: async (d) => {
            await utils.candidates.getOne.cancel({ id: userId });

            const prev = utils.candidates.getOne.getData({ id: userId });

            if (!prev) return;

            utils.candidates.getOne.setData(
                {
                    id: userId,
                },
                {
                    ...prev,
                    candidateProfilesToProjectInstances: prev.candidateProfilesToProjectInstances?.map((p) => (p.projectInstanceId === d.projectInstanceId ? { ...p, visible: d.visible } : p)) ?? [],
                }
            );

            return prev;
        },
        onSuccess: () => {
            void utils.candidates.getOne.invalidate({ id: userId });
        },
    });

    const { data: candidate, error, isLoading } = api.candidates.getOne.useQuery(userId.startsWith('@') ? { githubUsername: userId.slice(1) } : { id: userId });

    const awardEditorRef = useRef<AwardEditorHandle>(null);
    const [isSaving, setIsSaving] = useState(false);
    const handleSaveAll = async () => {
        try {
            setIsSaving(true);
            await form.handleSubmit();
            if (awardEditorRef.current?.hasChanges) {
                await awardEditorRef.current.saveChanges();
            }
            setIsSaving(false);
        } catch (err) {
            console.error('Error during save:', err);
        }
    };

    const form = useForm({
        defaultValues: {
            displayName: candidate?.displayName ?? '',
            publicEmail: candidate?.publicEmail ?? '',
            bio: candidate?.bio ?? '',
            location: candidate?.location ?? '',
            linkedinURL: candidate?.linkedinURL ?? '',
            imageUrl: candidate?.imageUrl ?? '',
            bannerUrl: candidate?.bannerUrl ?? '',
        } satisfies z.infer<typeof formSchema>,
        onSubmit: (values) => {
            updateCandidate.mutate(values.value);
        },
        validators: {
            onSubmit: formSchema,
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center">
                <LoaderCircle className="mx-auto animate-spin" />
            </div>
        );
    }

    if (session?.data?.user.id !== candidate?.userId) {
        return (
            <div className="flex h-full w-full items-center justify-center gap-2">
                <HandIcon />
                This isn&apos;t your profile!
            </div>
        );
    }

    if (error) {
        return <div>Error loading user: {error.message}</div>;
    }

    return (
        <div>
            <div>
                <div className="relative h-60 w-full">
                    {/* Banner Image */}
                    <form.Field name="bannerUrl">
                        {(field) => (
                            <ImageUpload
                                currentImageUrl={field.state.value || undefined}
                                uploadType="banner"
                                onImageChange={(imageUrl) => field.handleChange(imageUrl || '')}
                                className={'w-full h-60 rounded-lg'}
                                disabled={updateCandidate.isPending || isSaving}
                            />
                        )}
                    </form.Field>
                </div>
                <div className="space-y-8 p-15">
                    <div className="z-30 -mt-30 flex flex-col gap-4">
                        <form
                            className="flex flex-col gap-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                        >
                            {/*Profile Picture*/}
                            <form.Field name="imageUrl">
                                {(field) => (
                                    <ImageUpload
                                        currentImageUrl={field.state.value || undefined}
                                        uploadType="profile"
                                        onImageChange={(imageUrl) => field.handleChange(imageUrl || '')}
                                        className={'w-24 h-24 rounded-xl box-content'}
                                        disabled={updateCandidate.isPending || isSaving}
                                    />
                                )}
                            </form.Field>
                            <form.Field name="displayName">
                                {(field) => (
                                    <div className="space-y-2">
                                        <Input
                                            type="input"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange((e.target as HTMLInputElement).value)}
                                            label="Display Name"
                                        />
                                        {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="bio">
                                {(field) => (
                                    <div className="space-y-2">
                                        <Input
                                            type="input"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            className="w-full"
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            label="Bio"
                                        />
                                        {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="location">
                                {(field) => (
                                    <div className="space-y-2">
                                        <Input
                                            type="input"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            className="w-full"
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            label="Location"
                                        />
                                        {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                                    </div>
                                )}
                            </form.Field>
                            <form.Field name="publicEmail">
                                {(field) => (
                                    <div className="space-y-2">
                                        <Input
                                            type="input"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            className="w-full"
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            label="Public Email"
                                        />
                                        {field.state.meta.errors.length > 0 && <div className="text-sm text-red-300 mt-1">{field.state.meta.errors.map((error) => error?.message).join(', ')}</div>}
                                    </div>
                                )}
                            </form.Field>
                            {/* Awards Section */}
                            <AwardEditor
                                ref={awardEditorRef}
                                userId={userId}
                                className="max-w-xl"
                            />
                            <Button
                                onClick={handleSaveAll}
                                type="button"
                                variant="outline"
                                disabled={updateCandidate.isPending || isSaving}
                            >
                                {(updateCandidate.isPending || isSaving) && <LoaderCircle className="animate-spin" />}
                                Save
                            </Button>
                        </form>
                    </div>
                    <div>
                        <h2>Jams</h2>
                        <div className="grid">
                            {candidate?.candidateProfilesToProjectInstances.map((cp) => (
                                <div
                                    className="flex items-center gap-2 rounded-md border p-4"
                                    key={cp.projectInstanceId}
                                >
                                    <Button
                                        onClick={() =>
                                            changeProjectVisibility.mutate({
                                                projectInstanceId: cp.projectInstanceId,
                                                visible: !cp.visible,
                                            })
                                        }
                                        className="h-6 w-6"
                                        variant="ghost"
                                        disabled={changeProjectVisibility.isPending}
                                    >
                                        {cp.visible ? <EyeIcon className="h-6 w-6" /> : <EyeOffIcon className="h-6 w-6" />}
                                    </Button>
                                    <p className={cn(!cp.visible && 'line-through')}>{cp.projectInstance.project.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
