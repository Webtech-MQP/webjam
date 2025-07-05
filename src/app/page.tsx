import { HydrateClient } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="flex flex-col gap-2 items-center justify-center h-screen">
        <h1>Landing page goes here!</h1>
        <Button asChild>
          <Link href="/signIn">Get started</Link>
        </Button>
      </div>
    </HydrateClient>
  );
}
