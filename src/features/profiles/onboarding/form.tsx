'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
    isRecruiter: z.string().refine((val) => val === 'yes' || val === 'no', {
        message: 'Please select recruiter status',
    }),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    bio: z.string(),
    location: z.string(),
});

// Onboarding form component
export function OnboardingWizard() {
    const createRecruiterProfile = api.recruiters.createMe.useMutation();
    const createCandidateProfile = api.candidates.createMe.useMutation();

    const router = useRouter();
    const session = useSession();

    const form = useForm({
        defaultValues: {
            isRecruiter: '',
            name: '',
            bio: '',
            location: '',
        },
        onSubmit: async ({ value }) => {
            console.log('Wizard completed:', value);

            const mutation = value.isRecruiter === 'yes' ? createRecruiterProfile : createCandidateProfile;
            const p = mutation.mutateAsync({
                displayName: value.name,
                bio: value.bio,
                location: value.location,
            });

            

            toast.promise(p);

            await p;

            if (value.isRecruiter === 'no') {
                router.push(!!session.data?.user.id ? `/users/${session.data.user.id}` : '/dashboard');
            } else {
                router.push('/recruiter');
            }
        },
        validators: {
            onBlur: onboardingSchema,
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
            <div className="w-full max-w-2xl mx-auto mt-2">
                {/* Form content */}
                <div className="space-y-6">
                    <Label className="text-sm text-gray-700">Are you a recruiter?</Label>
                    <form.Field name="isRecruiter">
                        {(field) => (
                            <>
                                <RadioGroup
                                    value={field.state.value}
                                    onValueChange={field.handleChange}
                                    onBlur={field.handleBlur}
                                    className="flex"
                                >
                                    <RadioGroupItem value="yes" />
                                    <Label>Yes</Label>
                                    <RadioGroupItem value="no" />
                                    <Label>No</Label>
                                </RadioGroup>
                                {field.state.meta.errors?.[0] && <p className="text-sm text-red-400">{field.state.meta.errors?.[0].message}</p>}
                            </>
                        )}
                    </form.Field>
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
                                Complete Profile {form.state.values.isRecruiter === 'yes' ? createRecruiterProfile.isPending : createCandidateProfile.isPending && <LoaderCircle className="animate-spin" />}
                            </Button>
                        </div>
                    )}
                </form.Subscribe>
            </div>
        </motion.div>
    );
}
