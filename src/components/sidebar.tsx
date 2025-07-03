"use client";

import { cn } from "@/lib/utils";
import { Home, Folders } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

const ROUTES = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: Folders,
  },
];

export function Sidebar() {
  const path = usePathname();

  const closestMatch = useCallback(() => {
    return ROUTES.reduce(
      (a, b) => {
        return path.startsWith(b.href) && b.href.length > a.href.length ? b : a;
      },
      { href: "", name: "", icon: Home },
    );
  }, [path]);

  return (
    <div className="border-accent h-full w-64 space-y-2 border-r p-4">
      <h1 className="text-primary font-bold">mqp</h1>
      <nav>
        {ROUTES.map((route) => (
          <Link
            key={route.name}
            href={route.href}
            className={cn(
              "hover:text-primary mb-4 flex items-center gap-3 p-4",
              closestMatch().href === route.href && "border-primary border-b-4",
            )}
          >
            <route.icon className="h-5 w-5" />
            {route.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
