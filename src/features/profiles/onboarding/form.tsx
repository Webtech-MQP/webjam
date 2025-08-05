'use client';

import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import { useForm } from '@tanstack/react-form';
import { LoaderCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import z from 'zod';
import { TextField } from './text-input';

const onboardingSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    bio: z.string(),
    location: z.string(),
});

// Onboarding form component
export function OnboardingWizard() {
    const createProfile = api.candidates.createMe.useMutation();

    const router = useRouter();

    const session = useSession();

    const form = useForm({
        defaultValues: {
            name: '',
            bio: '',
            location: '',
        } satisfies z.infer<typeof onboardingSchema>,
        onSubmit: async ({ value }) => {
            console.log('Wizard completed:', value);

            const p = createProfile.mutateAsync({
                displayName: value.name,
                bio: value.bio,
                location: value.location,
            });

            toast.promise(p);

            await p;

            router.push(!!session.data?.user.id ? `/users/${session.data.user.id}` : '/dashboard');
        },
        validators: {
            onChange: onboardingSchema,
        },
    });

    const handleSubmit = async () => {
        await form.handleSubmit();
    };

    return (
        <motion.div
            animate={{ opacity: 1 }}
            className="opacity-0"
            transition={{ duration: 1 }}
        >
            <h1>Hi! We&apos;ll make this quick.</h1>
            <div className="w-full max-w-2xl mx-auto">
                {/* Form content */}
                <div className="space-y-6">
                    <form.Field name="name">
                        {(field) => (
                            <TextField
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={field.state.value}
                                onChange={field.handleChange}
                                onBlur={field.handleBlur}
                                error={field.state.meta.errors?.[0]}
                            />
                        )}
                    </form.Field>
                    <form.Field name="location">
                        {(field) => (
                            <TextField
                                label="Location"
                                placeholder="Where are you based? (This is public!)"
                                value={field.state.value}
                                onChange={field.handleChange}
                                onBlur={field.handleBlur}
                                error={field.state.meta.errors?.[0]}
                            />
                        )}
                    </form.Field>
                    <form.Field name="bio">
                        {(field) => (
                            <TextField
                                label="Bio"
                                placeholder="Tell us about yourself"
                                value={field.state.value}
                                onChange={field.handleChange}
                                onBlur={field.handleBlur}
                                error={field.state.meta.errors?.[0]}
                            />
                        )}
                    </form.Field>
                </div>

                {/* Submit button */}
                <form.Subscribe
                    selector={(state) => ({
                        canSubmit: state.canSubmit,
                        isSubmitting: state.isSubmitting,
                    })}
                >
                    {(state) => (
                        <div className="flex justify-center mt-8">
                            <Button
                                type="button"
                                className="w-full"
                                disabled={!state.canSubmit || state.isSubmitting}
                                onClick={handleSubmit}
                            >
                                Complete Profile {createProfile.isPending && <LoaderCircle className="animate-spin" />}
                            </Button>
                        </div>
                    )}
                </form.Subscribe>
            </div>
        </motion.div>
    );
}
