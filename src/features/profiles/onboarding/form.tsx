'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useForm } from '@tanstack/react-form';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import z from 'zod';
import { TextField } from './text-input';

export interface OnboardingFormData {
    name: string;
    email: string;
    bio: string;
    interests: string;
    experience: string;
    goals: string;
}

const onboardingSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Please enter a valid email address.'),
    bio: z.string().min(10, 'Bio must be at least 10 characters'),
    interests: z.string().min(1, 'Interests are required'),
    experience: z.string().min(1, 'Experience level is required'),
});

// Wizard step configuration
export const wizardSteps = [
    {
        id: 'basic-info',
        title: 'Basic Information',
        description: "Let's start with the basics",
        fields: ['name', 'email'] as const,
    },
    {
        id: 'profile',
        title: 'Profile Details',
        description: 'Next, tell us about yourself',
        fields: ['bio', 'experience'] as const,
    },
] as const;

export type WizardStepId = (typeof wizardSteps)[number]['id'];

// Hook for managing wizard state
export function useWizardState() {
    const [currentStep, setCurrentStep] = useState<number>(0);

    const nextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, wizardSteps.length - 1));
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const goToStep = (stepIndex: number) => {
        setCurrentStep(Math.max(0, Math.min(stepIndex, wizardSteps.length - 1)));
    };

    return {
        currentStep,
        currentStepData: wizardSteps[currentStep],
        nextStep,
        prevStep,
        goToStep,
        isFirstStep: currentStep === 0,
        isLastStep: currentStep === wizardSteps.length - 1,
        totalSteps: wizardSteps.length,
    };
}

// Wizard form component
export function OnboardingWizard() {
    const wizard = useWizardState();

    const createProfile = api.candidates.createMe.useMutation();

    const form = useForm({
        defaultValues: {
            name: '',
            email: '',
            bio: '',
            interests: '',
            experience: '',
        } satisfies z.infer<typeof onboardingSchema>,
        onSubmit: async ({ value }) => {
            console.log('Wizard completed:', value);

            await createProfile.mutateAsync({
                ...value,
                displayName: value.name,
            });
        },
        validators: {
            onChange: onboardingSchema,
        },
    });

    const [, forceUpdate] = useState({});
    useEffect(() => {
        const unsubscribe = form.store.subscribe(() => {
            forceUpdate({});
        });
        return unsubscribe;
    }, [form.store]);

    // Check if current step has validation errors (reactive to form state)
    const currentStepHasErrors = (() => {
        const currentFields = wizard.currentStepData?.fields || [];
        return currentFields.some((fieldName) => {
            const fieldMeta = form.getFieldMeta(fieldName);
            return fieldMeta?.errors && fieldMeta.errors.length > 0;
        });
    })();

    // Check if current step has been touched
    const currentStepTouched = (() => {
        const currentFields = wizard.currentStepData?.fields || [];
        return currentFields.some((fieldName) => {
            const fieldMeta = form.getFieldMeta(fieldName);
            return fieldMeta?.isTouched;
        });
    })();

    // Get validation summary for current step
    const currentStepValidation = (() => {
        const currentFields = wizard.currentStepData?.fields || [];
        const errors: string[] = [];
        const validFields: string[] = [];

        currentFields.forEach((fieldName) => {
            const fieldMeta = form.getFieldMeta(fieldName);
            if (fieldMeta?.errors && fieldMeta.errors.length > 0) {
                errors.push(...(fieldMeta.errors as string[]));
            } else if (fieldMeta?.isTouched) {
                validFields.push(fieldName);
            }
        });

        return {
            hasErrors: errors.length > 0,
            errorCount: errors.length,
            validFieldCount: validFields.length,
            totalFields: currentFields.length,
            canProceed: errors.length === 0 && currentStepTouched,
        };
    })();

    const handleNext = async () => {
        // Check if current step can proceed
        if (currentStepValidation.canProceed) {
            if (wizard.isLastStep) {
                // Submit the entire form
                console.log('Submitting');
                await form.handleSubmit();
            } else {
                wizard.nextStep();
            }
        } else {
            // Touch all fields in current step to show validation errors
            const currentFields = wizard.currentStepData?.fields || [];
            currentFields.forEach((fieldName) => {
                void form.validateField(fieldName, 'change');
            });
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress indicator */}
            <div className="mb-8">
                {' '}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                        Step {wizard.currentStep + 1} of {wizard.totalSteps}
                    </span>
                </div>
                <p className="text-muted-foreground mb-4">{wizard.currentStepData?.description}</p>
                {/* Progress bar */}
                <div className="w-full bg-muted-foreground h-0.5">
                    <div
                        className="h-0.5 bg-primary transition-all duration-300"
                        style={{ width: `${((wizard.currentStep + 1) / wizard.totalSteps) * 100}%` }}
                    />
                </div>
            </div>

            {/* Form content */}
            <div className="space-y-6">
                {/* Step 1: Basic Information */}
                {wizard.currentStep === 0 && (
                    <div className="space-y-4">
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
                        <form.Field name="email">
                            {(field) => (
                                <TextField
                                    label="Email Address"
                                    placeholder="Enter your email"
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    onBlur={field.handleBlur}
                                    error={field.state.meta.errors?.[0]}
                                />
                            )}
                        </form.Field>
                    </div>
                )}

                {/* Step 2: Profile Details */}
                {wizard.currentStep === 1 && (
                    <div className="space-y-4">
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
                        <form.Field name="experience">
                            {(field) => (
                                <TextField
                                    label="Experience Level"
                                    placeholder="Describe your experience"
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    onBlur={field.handleBlur}
                                    error={field.state.meta.errors?.[0]}
                                />
                            )}
                        </form.Field>
                    </div>
                )}

                {/* Step 3: Interests & Goals */}
                {wizard.currentStep === 2 && (
                    <div className="space-y-4">
                        <form.Field name="interests">
                            {(field) => (
                                <TextField
                                    label="Interests"
                                    placeholder="What are you interested in?"
                                    value={field.state.value}
                                    onChange={field.handleChange}
                                    onBlur={field.handleBlur}
                                    error={field.state.meta.errors?.[0]}
                                />
                            )}
                        </form.Field>
                    </div>
                )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
                <Button
                    type="button"
                    onClick={wizard.prevStep}
                    disabled={wizard.isFirstStep}
                    className={cn()}
                    size="icon"
                    variant="ghost"
                >
                    <ArrowLeft />
                </Button>

                <Button
                    type="button"
                    onClick={handleNext}
                    disabled={currentStepTouched && currentStepHasErrors}
                >
                    {wizard.isLastStep ? 'Complete' : 'Next'} <ArrowRight />
                </Button>
            </div>
        </div>
    );
}
