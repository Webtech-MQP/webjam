'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { ChevronDown, ChevronUp, Folder, Home, LogOut, Search, Users } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';

const ROUTES = [
    {
        name: 'Home',
        href: '/dashboard',
        icon: Home,
    },
    {
        name: 'Find a Jam',
        href: '/dashboard/jamFinder',
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
        href: '/admin',
        icon: Home,
    },
    {
        name: 'Projects',
        href: '/admin/projects',
        icon: Folder,
    },
];

export function Sidebar() {
    const path = usePathname();
    const { data: session } = useSession();
    const [profileOpen, setProfileOpen] = useState(false);

    const closestMatch = useCallback(() => {
        const allRoutes = [...ROUTES, ...ADMIN_ROUTES];
        return allRoutes.reduce(
            (a, b) => {
                return path.startsWith(b.href) && b.href.length > a.href.length ? b : a;
            },
            { href: '', name: '', icon: Home }
        );
    }, [path]);

    const { data: isAdmin } = api.users.isAdmin.useQuery();

    return (
        <div className="border-accent flex h-full w-64 flex-col border-r p-4">
            <h1 className="text-primary font-bold">webjam</h1>
            <nav className="flex-1">
                {ROUTES.map((route) => (
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
