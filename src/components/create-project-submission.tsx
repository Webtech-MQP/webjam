'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/trpc/react';
import { createId } from '@paralleldrive/cuid2';
import { DialogOverlay, DialogPortal } from '@radix-ui/react-dialog';
import { PlusCircle, X } from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';

interface CreateSubmissionFormSchema {
    repositoryURL: string;
    deploymentURL: string;
}

const defaultForm: CreateSubmissionFormSchema = {
    repositoryURL: '',
    deploymentURL: '',
};

interface CreateProjectSubmissionProps {
    projectId: string;
    submitter: string;
}

export default function CreateProjectSubmission(props: CreateProjectSubmissionProps) {
    const [dialogueOpen, setDialogueOpen] = useState<boolean>(false);
    const project = api.projects.getOne.useQuery({ id: props.projectId }, { enabled: !!props.projectId });
    const [formState, setFormState] = useState<CreateSubmissionFormSchema>({ ...defaultForm, repositoryURL: project.data?.repoURL ?? '' });
    const createProject = api.projectSubmission.createOne.useMutation();

    async function onSubmit() {
        if (!props.projectId || !props.submitter) {
            toast.error('Project ID and submitter are required.');
            return;
        }

        if (!formState.repositoryURL || !isValidHttpUrl(formState.repositoryURL)) {
            toast.error('Please enter a valid repository URL.');
            return;
        }
        if (!formState.deploymentURL || !isValidHttpUrl(formState.deploymentURL)) {
            toast.error('Please enter a valid deployment URL.');
            return;
        }
        const id = createId();
        const promise = createProject.mutateAsync({
            id,
            projectId: props.projectId,
            submittedBy: props.submitter,
            repositoryURL: formState.repositoryURL,
            deploymentURL: formState.deploymentURL,
            submittedOn: new Date(),
            status: 'submitted',
        });
        toast.promise(promise, {
            loading: 'Submitting...',
            success: 'Submission successful!',
            error: 'Failed to submit.',
        });
        try {
            await promise;
            onDiscard();
        } catch (err) {
            // error toast already handled by toast.promise
        }
    }

    function onDiscard() {
        setDialogueOpen(false);
        if (!props.projectId) {
            setFormState(defaultForm);
        }
    }

    return (
        <Dialog open={dialogueOpen}>
            <DialogTrigger
                onClick={() => {
                    setDialogueOpen(true);
                }}
                asChild
            >
                <Button className="w-full justify-start rounded-lg border-0 bg-orange-600/20 text-orange-400 hover:bg-orange-500/50 px-3 py-2">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center mr-3">
                        <PlusCircle className="w-4 h-4" />
                    </span>
                    New Submission
                </Button>
            </DialogTrigger>
            <DialogPortal>
                <DialogOverlay />
                <DialogContent
                    className="w-screen max-h-2/3 min-w-3/5 overflow-y-scroll"
                    showCloseButton={false}
                >
                    <DialogHeader>
                        <div className="w-full flex justify-between">
                            <DialogTitle>Submit Project</DialogTitle>
                            <DialogClose
                                className="hover:cursor-pointer"
                                onClick={() => {
                                    setDialogueOpen(false);
                                }}
                            >
                                <X />
                            </DialogClose>
                        </div>
                        <DialogDescription>Submissions will be reviewed by the admin team. Please ensure your project meets the requirements before submitting.</DialogDescription>
                    </DialogHeader>
                    <div className="grid w-full items-center gap-3">
                        <Label htmlFor="repositoryURL">Repository URL</Label>
                        <Input
                            type="url"
                            id="repositoryURL"
                            placeholder="Repository URL"
                            autoFocus
                            required
                            minLength={1}
                            value={formState.repositoryURL}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormState({ ...formState, repositoryURL: e.target.value })}
                        />
                        {formState.repositoryURL && !isValidHttpUrl(formState.repositoryURL) && <p className="text-red-500 text-sm">Please enter a valid URL.</p>}
                        <Label htmlFor="deploymentURL">Deployment URL</Label>
                        <Input
                            type="url"
                            id="deploymentURL"
                            placeholder="Deployment URL"
                            required
                            minLength={1}
                            value={formState.deploymentURL}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormState({ ...formState, deploymentURL: e.target.value })}
                        />
                        {formState.deploymentURL && !isValidHttpUrl(formState.deploymentURL) && <p className="text-red-500 text-sm">Please enter a valid URL.</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setDialogueOpen(false);
                                setFormState(defaultForm);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={onSubmit}>Submit</Button>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}

function isValidHttpUrl(str: string) {
    let url;

    try {
        url = new URL(str);
    } catch (_) {
        return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
}
