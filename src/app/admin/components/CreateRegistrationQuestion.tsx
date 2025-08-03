'use client';

import { api } from '@/trpc/react';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface QuestionFormState {
    question: string;
    type: 'text' | 'select';
    options: string[];
    required: boolean;
}

const defaultForm: QuestionFormState = {
    question: '',
    type: 'text',
    options: [],
    required: true,
};

export default function CreateRegistrationQuestion() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formState, setFormState] = useState<QuestionFormState>(defaultForm);
    const [optionInput, setOptionInput] = useState('');

    const createQuestion = api.projectRegistration.createQuestion.useMutation();
    const utils = api.useUtils();

    const addOption = () => {
        if (optionInput.trim()) {
            setFormState(prev => ({
                ...prev,
                options: [...prev.options, optionInput.trim()]
            }));
            setOptionInput('');
        }
    };

    const removeOption = (index: number) => {
        setFormState(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const onSubmit = async () => {
        const promise = createQuestion.mutateAsync({
            question: formState.question,
            type: formState.type,
            options: formState.options.length > 0 ? JSON.stringify(formState.options) : undefined,
            required: formState.required,
        });

        toast.promise(promise, {
            loading: 'Creating question...',
            success: 'Question created successfully!',
            error: 'Failed to create question.',
        });

        try {
            await promise;
            await utils.projectRegistration.getAllQuestions.invalidate();
            onClose();
        } catch (err) {

        }
    };

    const onClose = () => {
        setDialogOpen(false);
        setFormState(defaultForm);
        setOptionInput('');
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setDialogOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Registration Question
                </Button>
            </DialogTrigger>
            <DialogPortal>
                <DialogOverlay />
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Registration Question</DialogTitle>
                        <DialogDescription>
                            Create a new question for project registration forms.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="question">Question</Label>
                            <Textarea
                                id="question"
                                placeholder="Enter your question..."
                                value={formState.question}
                                onChange={(e) => setFormState(prev => ({ ...prev, question: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Question Type</Label>
                            <Select
                                value={formState.type}
                                onValueChange={(value: 'text' | 'select' ) => 
                                    setFormState(prev => ({ ...prev, type: value }))
                                }
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select a question type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="select">Single Select</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(formState.type === 'select') && (
                            <div className="grid gap-2">
                                <Label>Options</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add an option..."
                                        value={optionInput}
                                        onChange={(e) => setOptionInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addOption();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        onClick={addOption}
                                    >
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formState.options.map((option, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full"
                                        >
                                            <span>{option}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 rounded-full"
                                                onClick={() => removeOption(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Switch
                                id="required"
                                checked={formState.required}
                                onCheckedChange={(checked) => 
                                    setFormState(prev => ({ ...prev, required: checked }))
                                }
                            />
                            <Label htmlFor="required">Required Question</Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onSubmit}
                            disabled={!formState.question.trim() || 
                                    ((formState.type === 'select') &&
                                     formState.options.length === 0)}
                        >
                            Create Question
                        </Button>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
