'use client';

import { api } from '@/trpc/react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface ProjectRegistrationFlowProps {
    projectId: string;
    open: boolean;
    onClose: (wasSuccessful: boolean) => void;
}

interface RegistrationAnswer {
    questionId: string;
    answer: string;
}

export function ProjectRegistrationFlow({ projectId, open, onClose }: ProjectRegistrationFlowProps) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<RegistrationAnswer[]>([]);

    const questions = api.projectRegistration.getProjectQuestions.useQuery({ projectId });
    const createRegistration = api.projectRegistration.createRegistration.useMutation();

    useEffect(() => {
        if (open) {
            setStep(0);
            setAnswers([]);
        }
    }, [open]);

    const currentQuestion = questions.data?.[step];
    const isLastQuestion = step === (questions.data?.length ?? 0) - 1;
    const showSummary = step === questions.data?.length;

    const updateAnswer = (answer: string) => {
        if (!currentQuestion) return;

        setAnswers((prev) => {
            const existingIndex = prev.findIndex((a) => a.questionId === currentQuestion.id);
            if (existingIndex >= 0) {
                const newAnswers = [...prev];
                newAnswers[existingIndex] = { questionId: currentQuestion.id, answer };
                return newAnswers;
            }
            return [...prev, { questionId: currentQuestion.id, answer }];
        });
    };

    const getCurrentAnswer = () => {
        return answers.find((a) => a.questionId === currentQuestion?.id)?.answer ?? '';
    };

    const canProceed = () => {
        if (!currentQuestion) return true;
        if (currentQuestion.required && !getCurrentAnswer()) return false;
        return true;
    };

    const handleNext = () => {
        if (!canProceed()) return;
        setStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        const promise = createRegistration.mutateAsync({
            projectId,
            answers,
            //TODO: fix
            preferredRole: 'fullstack',
        });

        toast.promise(promise, {
            loading: 'Submitting registration...',
            success: 'Registration submitted successfully!',
            error: 'Failed to submit registration.',
        });

        try {
            await promise;
            onClose(true);
        } catch (err) {}
    };

    const renderQuestionInput = () => {
        if (!currentQuestion) return null;

        const currentAnswer = getCurrentAnswer();

        switch (currentQuestion.type) {
            case 'select':
                if (!currentQuestion.options) return null;
                const options = JSON.parse(currentQuestion.options) as string[];
                return (
                    <div className="space-y-3">
                        {options.map((option) => (
                            <div
                                key={option}
                                className="flex items-center space-x-3"
                            >
                                <div className="relative flex items-center">
                                    <input
                                        type="radio"
                                        id={option}
                                        name={currentQuestion.id}
                                        value={option}
                                        checked={currentAnswer === option}
                                        onChange={(e) => updateAnswer(e.target.value)}
                                        className="text-muted-foreground peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-stone-300 bg-white checked:border-[#d37c04] checked:bg-white focus:outline-none focus:ring-2 focus:ring-[#d37c04]/25"
                                    />
                                    <div className="pointer-events-none absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d37c04] opacity-0 transition-opacity peer-checked:opacity-100"></div>
                                </div>
                                <Label
                                    htmlFor={option}
                                    className="text-sm font-normal cursor-pointer select-none text-muted-foreground peer-checked:text-foreground"
                                >
                                    {option}
                                </Label>
                            </div>
                        ))}
                    </div>
                );
            default:
                return (
                    <Textarea
                        value={currentAnswer}
                        onChange={(e) => updateAnswer(e.target.value)}
                        placeholder="Enter your answer..."
                        className="min-h-[100px]"
                    />
                );
        }
    };

    const renderSummary = () => {
        if (!questions.data) return null;

        return (
            <div className="space-y-4">
                <DialogHeader>
                    <DialogTitle>Review Your Answers</DialogTitle>
                    <DialogDescription>Please review your answers before submitting.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {questions.data.map((question, index) => {
                        const answer = answers.find((a) => a.questionId === question.id);
                        return (
                            <div
                                key={question.id}
                                className="space-y-2"
                            >
                                <Label className="font-medium">
                                    {index + 1}. {question.question}
                                    {question.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                <p className="text-sm text-muted-foreground dark:text-muted-foreground border p-2 rounded-md">{answer?.answer || 'No answer provided'}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-between pt-4">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createRegistration.isPending}
                    >
                        {createRegistration.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                Submit Registration
                                <Check className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={onClose}
        >
            <DialogPortal>
                <DialogOverlay />
                <DialogContent
                    style={{ zIndex: 999 }}
                    className="sm:max-w-[600px]"
                >
                    <VisuallyHidden>
                        <DialogTitle>Register for project</DialogTitle>
                    </VisuallyHidden>
                    {!showSummary ? (
                        questions.data && currentQuestion ? (
                            <div className="space-y-4">
                                <DialogHeader>
                                    <DialogTitle>Project Registration</DialogTitle>
                                    <DialogDescription>
                                        Question {step + 1} of {questions.data.length}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>
                                            {currentQuestion.question}
                                            {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                                        </Label>
                                        {renderQuestionInput()}
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={handleBack}
                                        disabled={step === 0}
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleNext}
                                        disabled={!canProceed()}
                                    >
                                        {isLastQuestion ? 'Review' : 'Next'}
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        )
                    ) : (
                        renderSummary()
                    )}
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
