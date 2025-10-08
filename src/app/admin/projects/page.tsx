'use client';

import { ProjectCard } from '@/components/project-card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/trpc/react';
import { Ellipsis, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Page() {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [nameFilter, setNameFilter] = useState<string>('');

    const { data: projects } = api.projects.getAll.useQuery();

    const filteredProjects = projects?.filter((project) => (statusFilter === 'all' || project.status === statusFilter) && (nameFilter === '' || project.title.toLowerCase().includes(nameFilter.toLowerCase())));

    if (!filteredProjects) {
        return <LoaderCircle className="animate-spin" />;
    }

    return (
        <div>
            <h1>Manage Projects</h1>
            <Tabs
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
                defaultValue="created"
                className="w-full mb-4"
            >
                <TabsList className="w-full">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="created">Created</TabsTrigger>
                    <TabsTrigger value="judging">Judging</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
            </Tabs>
            <Input
                placeholder="Search by name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="w-full mb-4"
            />
            <div className="grid grid-cols-3 gap-4 overflow-y-auto">
                {filteredProjects.map((p) => (
                    <div
                        className="relative"
                        key={p.id}
                    >
                        <Link
                            href={`/admin/projects/${p.id}`}
                            className="w-full"
                        >
                            <ProjectCard
                                key={p.id}
                                className="h-80"
                                {...p}
                                explicitStatus={p.status}
                            />
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className="absolute top-2 right-2 bg-background/70"
                                    variant="secondary"
                                    size="icon"
                                >
                                    <Ellipsis className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <div className="flex flex-col gap-2">
                                    <Link href={`/admin/projects/${p.id}`}>
                                        <DropdownMenuItem className="hover:cursor-pointer">View Project</DropdownMenuItem>
                                    </Link>
                                    <Link href={`/admin/projects/${p.id}/edit`}>
                                        <DropdownMenuItem className="hover:cursor-pointer">Edit Project</DropdownMenuItem>
                                    </Link>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </div>
        </div>
    );
}
