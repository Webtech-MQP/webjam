"use client"

import { cn } from "@/lib/utils";
import { Home, Folders, ChevronUp, ChevronDown, Settings, LogOut } from "lucide-react"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";


const ROUTES = [{
	name: "Home",
	href: "/dashboard",
	icon: Home,
},
{
	name: "Projects",
	href: "/dashboard/projects",
	icon: Folders,
}]

export function Sidebar() {
	const path = usePathname();
	const { data: session } = useSession();
	const [ profileOpen, setProfileOpen ] = useState(false);

    console.log(session?.user.image);

	const closestMatch = useCallback(() => {
		return ROUTES.reduce((a, b) => {
			return path.startsWith(b.href) && b.href.length > a.href.length ? b : a;
		}, { href: "", name: "", icon: Home });
	}, [path])

	return (
        <div className="w-64 h-full border-r border-accent p-4 flex flex-col">
            <h1 className="text-primary font-bold">mqp</h1>
            <nav className="flex-1">
                {ROUTES.map((route) => (
                    <Link
                        key={route.name}
						href={route.href}
                        className={cn("flex items-center gap-3 mb-4 p-4 hover:text-primary", closestMatch().href === route.href && "border-b-4 border-primary")}
                    >
                        <route.icon className="w-5 h-5" />
                        {route.name}
                    </Link>
                ))}
            </nav>
            <div className="mt-auto">
                <div
                    className={cn(
                        "overflow-hidden transition-all duration-300",
                        profileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                    )}
                >
                    <div className="flex flex-col items-left gap-4 p-4">
						<div className="flex items-center gap-3 hover:text-primary">
							<Settings className="w-5 h-5" />
                        	<button className="text-left cursor-pointer transition-colors">Settings</button>
						</div>
						<div className="flex items-center gap-3 hover:text-primary">	
							<LogOut className="w-5 h-5" />
                        	<button className="text-left cursor-pointer hover:text-primary transition-colors" onClick={() => signOut()}>Sign out</button>
						</div>
                    </div>
                </div>
                <div
                    onClick={() => setProfileOpen(prevState => !prevState)}
                    className="flex justify-between border border-accent rounded-md p-2 items-center gap-4 w-full cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <div className="relative w-5 h-5">
                            <Image
                                fill
                                objectFit="contain"
                                src={session?.user?.image ?? "/default-avatar.png"}
                                alt="User Avatar"
                                className="w-5 h-5 rounded-full"
                            />
                        </div>
                        <p className="text-sm">My profile</p>
                    </div>
                    {profileOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </div>
        </div>
    );
}