'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ellipsis } from 'lucide-react';
import { Textarea } from './ui/textarea';

export function UserActionsMenu() {
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
                                <DialogTitle>Reporting </DialogTitle>
                                <DialogDescription>Please provide a reason and a description for reporting this user.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <Label htmlFor="name-1">Reason</Label>
                                    <Input
                                        id="name-1"
                                        name="name"
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="username-1">Description</Label>
                                    <Textarea
                                        id="username-1"
                                        name="username"
                                        placeholder="Please provide a detailed description of the issue."
                                        className="resize-none"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Report user</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
