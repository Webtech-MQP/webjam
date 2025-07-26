'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/features/profiles/editor/input';
import { api } from '@/trpc/react';
import { useForm } from '@tanstack/react-form';
import { Ellipsis, LoaderCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UserActionsMenuProps {
    reportedUserName: string;
    reportedUserId: string;
}

export function UserActionsMenu({ reportedUserName, reportedUserId }: UserActionsMenuProps) {
    const dialogCloseRef = useRef<HTMLButtonElement>(null);

    const createReport = api.reports.create.useMutation();

    const form = useForm({
        defaultValues: {
            reason: '',
            description: '',
        },
        onSubmit: (values) => {
            createReport.mutate({
                candidateId: reportedUserId,
                reason: values.value.reason,
                description: values.value.description,
            });
        },
    });

    useEffect(() => {
        createReport.isSuccess ? (toast.success('Report submitted successfully. The team will review it shortly.'), form.reset(), dialogCloseRef.current?.click()) : null;
    }, [form, createReport]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className="ml-auto"
                    variant="ghost"
                    size="sm"
                >
                    <Ellipsis />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56"
                align="end"
            >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <Dialog>
                        <DialogTrigger asChild>
                            <DropdownMenuItem
                                className="text-red-600"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                Report User
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Reporting {reportedUserName}</DialogTitle>
                                <DialogDescription>Please provide a reason and a description for reporting this user.</DialogDescription>
                            </DialogHeader>
                            <form
                                className="flex flex-col gap-4"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                <form.Field
                                    name="reason"
                                    validators={{
                                        onChange: ({ value }) => (!value.trim() ? 'Reason is required.' : undefined),
                                    }}
                                >
                                    {(field) => (
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                type="input"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange((e.target as HTMLInputElement).value)}
                                                label="Reason"
                                            />
                                            {!field.state.meta.isValid && field.state.meta.errors.length > 0 && <span className="text-xs text-red-500">{field.state.meta.errors.join(', ')}</span>}
                                        </div>
                                    )}
                                </form.Field>
                                <form.Field
                                    name="description"
                                    validators={{
                                        onChange: ({ value }) => (!value.trim() ? 'Description is required.' : undefined),
                                    }}
                                >
                                    {(field) => (
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                type="textarea"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                className="w-full"
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                label="Description"
                                            />
                                            {!field.state.meta.isValid && field.state.meta.errors.length > 0 && <span className="text-xs text-red-500">{field.state.meta.errors.join(', ')}</span>}
                                        </div>
                                    )}
                                </form.Field>
                            </form>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button
                                        variant="outline"
                                        ref={dialogCloseRef}
                                        onClick={() => form.reset()}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    onClick={() => form.handleSubmit()}
                                    type="submit"
                                >
                                    {createReport.isPending && <LoaderCircle className="animate-spin" />}
                                    Submit report
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
