'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { skipToken } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Code, Folder, Home, LayoutDashboard, LogOut, Moon, Search, Sun, Users } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type Route = {
    name: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const COMMON_ROUTES = [
    {
        name: 'Home',
        href: '/dashboard/home',
        icon: Home,
    },
    {
        name: 'Candidates',
        href: '/users/search',
        icon: Users,
    },
];

const CANDIDATE_ROUTES = [
    {
        name: 'Find a Jam',
        href: '/dashboard/jam-finder',
        icon: Search,
    },
];

const ADMIN_ROUTES = [
    {
        name: 'Admin Panel',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        name: 'All Projects',
        href: '/admin/projects',
        icon: Folder,
    },
];

const RECRUITER_ROUTES: Route[] = [];

export function Sidebar() {
    const { theme, setTheme } = useTheme();
    const path = usePathname();
    const { data: session } = useSession();
    const [profileOpen, setProfileOpen] = useState(false);

    const closestMatch = useCallback(() => {
        const allRoutes = [...COMMON_ROUTES, ...CANDIDATE_ROUTES, ...ADMIN_ROUTES, ...RECRUITER_ROUTES];
        return allRoutes.reduce(
            (a, b) => {
                return path.startsWith(b.href) && b.href.length > a.href.length ? b : a;
            },
            { href: '', name: '', icon: Home }
        );
    }, [path]);

    const { data: me } = api.candidates.getOne.useQuery(
        session
            ? {
                  id: session.user.id,
              }
            : skipToken
    );

    const { data: myInstances } = api.projectInstances.getMyActive.useQuery(undefined, {
        throwOnError: false,
    });

    return (
        <div className="shrink-0 max-h-screen overflow-auto bg-accent dark:bg-background border-r flex h-full w-64 flex-col p-4">
            <Link href="/">
                <h1 className="text-primary dark:text-primary font-(family-name:--font-caprasimo)">webjam</h1>
            </Link>
            <nav className="mt-4">
                {myInstances && myInstances.length > 0 && (
                    <div className="p-4 border rounded mb-4">
                        <p className="font-mono text-muted-foreground">My Jams</p>
                        <div className="flex flex-col space-y-4">
                            {myInstances.map((j) => (
                                <Link
                                    key={j.id}
                                    href={`/dashboard/jams/${j.id}`}
                                    className={cn('hover:text-primary border-primary hover:border-l-1 hover:-ml-[1px] flex items-center gap-3 my-2 p-2', path.startsWith(`/dashboard/jams/${j.id}`) && 'border-l-3 -ml-[3px] bg-primary/10 dark:bg-primary/10 rounded-r')}
                                >
                                    <Code className="h-5 w-5" />
                                    {j.teamName}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                {COMMON_ROUTES.map((route, index) => (
                    <SidebarLink
                        key={index}
                        route={route}
                        isMatch={closestMatch().href === route.href}
                    />
                ))}
                {!!me &&
                    CANDIDATE_ROUTES.map((route, index) => (
                        <SidebarLink
                            key={index}
                            route={route}
                            isMatch={closestMatch().href === route.href}
                        />
                    ))}
                {session?.user.isRecruiter &&
                    RECRUITER_ROUTES.map((route, index) => (
                        <SidebarLink
                            key={index}
                            route={route}
                            isMatch={closestMatch().href === route.href}
                        />
                    ))}
                {session?.user.isAdmin && (
                    <>
                        <div className="my-auto" />
                        {ADMIN_ROUTES.map((route, index) => (
                            <SidebarLink
                                key={index}
                                route={route}
                                isMatch={closestMatch().href === route.href}
                            />
                        ))}
                    </>
                )}
            </nav>
            <Popover>
                <PopoverContent
                    className="p-4 bg-none w-56 flex items-left flex-col gap-4"
                    side="top"
                >
                    {session?.user?.isAdmin && (
                        <Link href="/admin">
                            <Badge className="w-full bg-green-800 hover:bg-green-900">LOGGED IN AS ADMIN</Badge>
                        </Link>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex justify-between items-center gap-2"
                                suppressHydrationWarning
                            >
                                <p suppressHydrationWarning>{theme === 'light' ? 'Light' : 'Dark'} Mode</p>
                                <div className="relative w-4 h-4">
                                    <Sun className="absolute top-0 left-0 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                    <Moon className="abolute top-0 left-0 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                                </div>
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {me && (
                        <div className="hover:text-primary flex items-center gap-3">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={session?.user.image ?? undefined} />
                                <AvatarFallback>{session?.user?.name?.split(' ')[0]?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Link
                                href={`/users/${session?.user.id}`}
                                className="cursor-pointer text-left transition-colors"
                            >
                                View Profile
                            </Link>
                        </div>
                    )}
                    <div className="hover:text-primary flex items-center gap-3">
                        <LogOut className="h-5 w-5" />
                        <button
                            className="hover:text-primary cursor-pointer text-left transition-colors"
                            onClick={() =>
                                signOut({
                                    redirectTo: '/',
                                })
                            }
                        >
                            Sign out
                        </button>
                    </div>
                </PopoverContent>
                <PopoverTrigger asChild>
                    <button className="mt-auto flex w-full cursor-pointer items-center justify-between gap-4 rounded-md border p-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={session?.user.image ?? undefined} />
                                <AvatarFallback>{session?.user?.name?.split(' ')[0]?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="">My profile</p>
                        </div>
                        {profileOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                </PopoverTrigger>
            </Popover>
        </div>
    );
}
function SidebarLink({ route, isMatch }: { route: Route; isMatch: boolean }) {
    return (
        <Link
            key={route.name}
            href={route.href}
            className={cn('border-black dark:border-primary hover:-ml-[2px] dark:hover:text-primary hover:border-l-2 mb-4 flex items-center gap-3 p-4', isMatch && 'border-l-3 -ml-[3px] bg-primary/10 dark:bg-primary/10 rounded-r')}
        >
            <route.icon className="h-5 w-5" />
            {route.name}
        </Link>
    );
}
