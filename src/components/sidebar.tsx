'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { skipToken } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Code, Folder, Home, LogOut, Search, Users } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';

const CANDIDATE_ROUTES = [
    {
        name: 'Home',
        href: '/dashboard/home',
        icon: Home,
    },
    {
        name: 'Find a Jam',
        href: '/dashboard/jam-finder',
        icon: Search,
    },
    {
        name: 'Candidates',
        href: '/users/search',
        icon: Users,
    },
];

const ADMIN_ROUTES = [
    {
        name: 'Dashboard',
        href: '/dashboard/home',
        icon: Home,
    },
    {
        name: 'Projects',
        href: '/admin/projects',
        icon: Folder,
    },
];

const RECRUITER_ROUTES = [
    {
        name: 'Home',
        href: '/dashboard/home',
        icon: Home,
    },
    {
        name: 'Candidates',
        href: '/recruiters/candidates',
        icon: Users,
    },
];

export function Sidebar() {
    const path = usePathname();
    const { data: session } = useSession();
    const [profileOpen, setProfileOpen] = useState(false);

    const closestMatch = useCallback(() => {
        const allRoutes = [...CANDIDATE_ROUTES, ...ADMIN_ROUTES, ...RECRUITER_ROUTES];
        return allRoutes.reduce(
            (a, b) => {
                return path.startsWith(b.href) && b.href.length > a.href.length ? b : a;
            },
            { href: '', name: '', icon: Home }
        );
    }, [path]);

    const { data: isAdmin } = api.users.isAdmin.useQuery();

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
        <div className="border-accent flex h-full w-64 flex-col border-r p-4">
            <h1 className="text-primary font-bold">webjam</h1>
            <nav className="flex-1">
                {myInstances && myInstances.length > 0 && (
                    <div className="p-4 border mb-4">
                        <p className="font-mono text-muted-foreground">My Jams</p>
                        <div className="flex flex-col space-y-4">
                            {myInstances.map((j) => (
                                <Link
                                    key={j.id}
                                    href={`/dashboard/jams/${j.id}`}
                                    className={cn('hover:text-primary flex items-center gap-3 p-4', path.startsWith(`/dashboard/jams/${j.id}`) && 'border-primary border-b-4')}
                                >
                                    <Code className="h-5 w-5" />
                                    {j.teamName}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                {session?.user.role === 'candidate' &&
                    CANDIDATE_ROUTES.map((route) => (
                        <Link
                            key={route.name}
                            href={route.href}
                            className={cn('hover:text-primary mb-4 flex items-center gap-3 p-4', closestMatch().href === route.href && 'border-primary border-b-4')}
                        >
                            <route.icon className="h-5 w-5" />
                            {route.name}
                        </Link>
                    ))}
                {session?.user.role === 'recruiter' &&
                    RECRUITER_ROUTES.map((route) => (
                        <Link
                            key={route.name}
                            href={route.href}
                            className={cn('hover:text-primary mb-4 flex items-center gap-3 p-4', closestMatch().href === route.href && 'border-primary border-b-4')}
                        >
                            <route.icon className="h-5 w-5" />
                            {route.name}
                        </Link>
                    ))}
                {isAdmin && (
                    <>
                        <div className="my-4 border-t border-muted" />
                        <div className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</div>
                        {ADMIN_ROUTES.map((route) => (
                            <Link
                                key={route.name}
                                href={route.href}
                                className={cn('hover:text-primary mb-4 flex items-center gap-3 p-4', closestMatch().href === route.href && 'border-primary border-b-4')}
                            >
                                <route.icon className="h-5 w-5" />
                                {route.name}
                            </Link>
                        ))}
                    </>
                )}
            </nav>
            <div className="mt-auto">
                <div className={cn('overflow-hidden transition-all duration-300', profileOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0')}>
                    <div className="items-left border-accent flex flex-col gap-4 rounded border-2 p-4">
                        {isAdmin && (
                            <Link href="/admin">
                                <Badge className="w-full bg-green-800 hover:bg-green-900">LOGGED IN AS ADMIN</Badge>
                            </Link>
                        )}
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
                                onClick={() => signOut()}
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
                <div
                    onClick={() => setProfileOpen((prevState) => !prevState)}
                    className="border-accent flex w-full cursor-pointer items-center justify-between gap-4 rounded-md border p-2"
                >
                    <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={session?.user.image ?? undefined} />
                            <AvatarFallback>{session?.user?.name?.split(' ')[0]?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="">My profile</p>
                    </div>
                    {profileOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
            </div>
        </div>
    );
}
