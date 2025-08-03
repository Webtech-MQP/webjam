'use client';

import { api } from '@/trpc/react';
import { GripVertical } from 'lucide-react';
import { Plus, X } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import CreateRegistrationQuestion from './CreateRegistrationQuestion';
import type { RouterOutputs } from '@/trpc/react';

type QuestionType = 'text' | 'select';

interface Question {
    id: string;
    question: string;
    type: QuestionType;
    options: string | null;
    required: boolean;
    order?: number;
    createdBy?: string | null;
}

interface ProjectRegistrationSectionProps {
    projectId?: string;
    defaultQuestions?: Question[];
}

export default function ProjectRegistrationSection({ projectId, defaultQuestions = [] }: ProjectRegistrationSectionProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState<Question[]>(defaultQuestions);

    const allQuestions = api.projectRegistration.getAllQuestions.useQuery();
    const connectQuestions = api.projectRegistration.updateQuestionsToProject.useMutation();
    const projectQuestions = api.projectRegistration.getProjectQuestions.useQuery(
        { projectId: projectId ?? '' },
        { enabled: !!projectId }
    );

    const utils = api.useUtils();

    const transformQuestion = (q: RouterOutputs['projectRegistration']['getProjectQuestions'][number] | RouterOutputs['projectRegistration']['getAllQuestions'][number]): Question | null => {
        if (!q.type || !q.question) return null;
        return {
            id: q.id,
            question: q.question,
            type: q.type as QuestionType,
            options: q.options,
            required: q.required ?? true,
            order: 'order' in q ? q.order : 0
        };
    };

    useEffect(() => {
        if (projectQuestions.data) {
            const validQuestions = projectQuestions.data
                .map(transformQuestion)
                .filter((q): q is Question => q !== null);
            
            setSelectedQuestions(validQuestions);
        }
    }, [projectQuestions.data]);

    const availableQuestions = useMemo(() => 
        allQuestions.data?.map(transformQuestion)
            .filter((q): q is Question => 
                q !== null && !selectedQuestions.some(sq => sq.id === q.id)
            ) ?? [], 
    [allQuestions.data, selectedQuestions]);

    const addQuestion = (question: Question) => {
        setSelectedQuestions((prev) => [
            ...prev,
            { ...question, order: prev.length }
        ]);
    };

    const removeQuestion = (questionId: string) => {
        setSelectedQuestions((prev) => 
            prev.filter((q) => q.id !== questionId)
                .map((q, index) => ({ ...q, order: index }))
        );
    };

    const moveQuestion = (fromIndex: number, toIndex: number) => {
        setSelectedQuestions((prev) => {
            const newQuestions = [...prev];
            const [movedItem] = newQuestions.splice(fromIndex, 1);
            if (movedItem) {
                newQuestions.splice(toIndex, 0, movedItem);
            }
            return newQuestions.map((q, index) => ({ ...q, order: index }));
        });
    };

    const onSave = async () => {
        if (!projectId) return;

        const promise = connectQuestions.mutateAsync({
            projectId,
            questionIds: selectedQuestions.map(q => q.id),
        });

        toast.promise(promise, {
            loading: 'Updating registration questions...',
            success: 'Registration questions updated!',
            error: 'Failed to update registration questions.',
        });

        try {
            await promise;
            setDialogOpen(false);
        } catch (err) {
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>Registration Questions</Label>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Manage Questions
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Manage Registration Questions</DialogTitle>
                            <DialogDescription>
                                Add or remove questions that candidates need to answer when registering for this project.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6">
                            <CreateRegistrationQuestion />

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Selected Questions</h4>
                                <div className="rounded-lg border max-h-[220px] overflow-y-auto">
                                    {selectedQuestions.map((question, index) => (
                                        <div
                                            key={question.id}
                                            className="flex items-center justify-between p-4 hover:bg-accent"
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('text/plain', index.toString());
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                                moveQuestion(fromIndex, index);
                                            }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">{question.question}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {question.type} {question.required ? '(Required)' : '(Optional)'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeQuestion(question.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {selectedQuestions.length === 0 && (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No questions selected
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Available Questions</h4>
                                <div className="rounded-lg border max-h-[220px] overflow-y-auto">
                                    {availableQuestions.map((question) => (
                                        <div
                                            key={question.id}
                                            className="flex items-center justify-between p-4 hover:bg-accent"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{question.question}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {question.type} {question.required ? '(Required)' : '(Optional)'}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => addQuestion(question)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {availableQuestions.length === 0 && (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No available questions
                                        </div>
                                    )}
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
                                disabled={!projectId}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-lg border">
                {selectedQuestions.map((question, index) => (
                    <div
                        key={question.id}
                        className="flex items-center gap-4 p-4"
                    >
                        <span className="text-sm text-muted-foreground">{index + 1}.</span>
                        <div>
                            <p className="text-sm font-medium">{question.question}</p>
                            <p className="text-sm text-muted-foreground">
                                {question.type} {question.required ? '(Required)' : '(Optional)'}
                            </p>
                        </div>
                    </div>
                ))}
                {selectedQuestions.length === 0 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No registration questions set up yet
                    </div>
                )}
            </div>
        </div>
    );
}
