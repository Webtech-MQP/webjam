"use client";

import { cn } from "@/lib/utils";
import { Home, Folders, ChevronUp, ChevronDown, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";

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
  const { data: session, status } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);

  console.log(session?.user.image);

  const closestMatch = useCallback(() => {
    return ROUTES.reduce(
      (a, b) => {
        return path.startsWith(b.href) && b.href.length > a.href.length ? b : a;
      },
      { href: "", name: "", icon: Home },
    );
  }, [path]);

  const { data: isAdmin } = api.users.isAdmin.useQuery();

  return (
    <div className="border-accent flex h-full w-64 flex-col border-r p-4">
      <h1 className="text-primary font-bold">mqp</h1>
      <nav className="flex-1">
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
      <div className="mt-auto">
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            profileOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0",
          )}
        >
          <div className="items-left border-accent flex flex-col gap-4 rounded border-2 p-4">
            {isAdmin && (
              <Badge className="w-full bg-green-800">LOGGED IN AS ADMIN</Badge>
            )}
            <div className="hover:text-primary flex items-center gap-3">
              <Avatar className="h-5 w-5">
                <AvatarImage src={session?.user.image ?? undefined} />
                <AvatarFallback>
                  {session?.user?.name?.split(" ")[0]?.charAt(0)}
                </AvatarFallback>
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
              <AvatarFallback>
                {session?.user?.name?.split(" ")[0]?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="">My profile</p>
          </div>
          {profileOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </div>
    </div>
  );
}
