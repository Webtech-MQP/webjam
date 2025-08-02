'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/features/profiles/editor/input';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useForm } from '@tanstack/react-form';
import { EyeIcon, EyeOffIcon, HandIcon, LinkedinIcon, LoaderCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

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
                    candidateProfilesToProjects: prev.candidateProfilesToProjects.map((p) => (p.projectId === d.projectId ? { ...p, visible: d.visible } : p)),
                }
            );

            return prev;
        },
        onSuccess: () => {
            void utils.candidates.getOne.invalidate({ id: userId });
        },
    });

    const { data: candidate, error, isLoading } = api.candidates.getOne.useQuery(userId.startsWith('@') ? { githubUsername: userId.slice(1) } : { id: userId });

    const form = useForm({
        defaultValues: {
            displayName: candidate?.displayName ?? '',
            bio: candidate?.bio ?? '',
            linkedinURL: candidate?.linkedinURL ?? '',
        },
        onSubmit: (values) => {
            updateCandidate.mutate(values.value);
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
                <div className="relative h-40 w-full">
                    {/* Banner Image */}
                    {/* TODO: We need S3 for this */}
                    <Image
                        src="https://placehold.co/100.png"
                        alt="Profile banner"
                        fill
                    />
                </div>
                <div className="space-y-8 p-15">
                    <div className="z-30 -mt-30 flex flex-col gap-4">
                        {/* Profile Picture */}
                        <Image
                            src={candidate?.imageUrl ?? 'https://placehold.co/100.png'}
                            className="relative z-20 box-content rounded-xl border-6 border-(--color-background)"
                            alt="Profile picture"
                            height={100}
                            width={100}
                        />
                        <form
                            className="flex flex-col gap-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                        >
                            <form.Field name="displayName">
                                {(field) => (
                                    <Input
                                        type="input"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange((e.target as HTMLInputElement).value)}
                                        label="Display Name"
                                    />
                                )}
                            </form.Field>
                            <form.Field name="bio">
                                {(field) => (
                                    <Input
                                        type="input"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        className="w-full"
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        label="Bio"
                                    />
                                )}
                            </form.Field>
                            <form.Field name="linkedinURL">
                                {(field) => (
                                    <Input
                                        type="input"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        className="w-full"
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        label="LinkedIn"
                                        icon={<LinkedinIcon className="h-4 w-4" />}
                                    />
                                )}
                            </form.Field>
                            <Button
                                onClick={() => form.handleSubmit()}
                                type="submit"
                                variant="outline"
                            >
                                {updateCandidate.isPending && <LoaderCircle className="animate-spin" />}
                                Save
                            </Button>
                        </form>
                    </div>
                    <div>
                        <h2>Jams</h2>
                        <div className="grid">
                            {candidate?.candidateProfilesToProjects.map((cp) => (
                                <div
                                    className="flex items-center gap-2 rounded-md border p-4"
                                    key={cp.projectId}
                                >
                                    <Button
                                        onClick={() =>
                                            changeProjectVisibility.mutate({
                                                projectId: cp.projectId,
                                                visible: !cp.visible,
                                            })
                                        }
                                        className="h-6 w-6"
                                        variant="ghost"
                                        disabled={changeProjectVisibility.isPending}
                                    >
                                        {cp.visible ? <EyeIcon className="h-6 w-6" /> : <EyeOffIcon className="h-6 w-6" />}
                                    </Button>
                                    <p className={cn(!cp.visible && 'line-through')}>{cp.project.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
