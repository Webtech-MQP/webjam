"use client"

import { cn } from "@/lib/utils";
import {Home, Folders} from "lucide-react"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

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

	const closestMatch = useCallback(() => {
		return ROUTES.reduce((a, b) => {
			return path.startsWith(b.href) && b.href.length > a.href.length ? b : a;
		}, { href: "", name: "", icon: Home });
	}, [path])

	return <div className="w-64 h-full border-r border-accent p-4 space-y-2">
		<h1 className="text-primary font-bold">mqp</h1>
		<nav>
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
	</div>;
}