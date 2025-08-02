import { JamCard } from '@/components/jam-card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { api } from '@/trpc/server';
import { Ellipsis } from 'lucide-react';
import Link from 'next/link';

export default async function Page() {
    const projects = await api.projects.getAll();

    return (
        <div>
            <div className="grid grid-cols-3 gap-4 overflow-y-auto">
                {projects.map((p) => (
                    <div
                        className="relative"
                        key={p.id}
                    >
                        <Link
                            href={`/dashboard/projects/${p.id}`}
                            className="w-full"
                        >
                            <JamCard
                                key={p.id}
                                className="h-80"
                                {...p}
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
                                    <Link href={`/dashboard/projects/${p.id}`}>
                                        <DropdownMenuItem className="hover:cursor-pointer">View Project</DropdownMenuItem>
                                    </Link>
                                    <Link href={`/dashboard/projects/${p.id}/edit`}>
                                        <DropdownMenuItem className="hover:cursor-pointer">Edit Project</DropdownMenuItem>
                                    </Link>
                                    {/*TODO: This*/}
                                    <Link href={'#'}>
                                        <DropdownMenuItem className="w-full hover:cursor-pointer">View Submissions</DropdownMenuItem>
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
