import { HydrateClient } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <h1>Landing page goes here!</h1>
        <Button asChild>
          <Link href="/signIn">Get started</Link>
        </Button>
      </div>
    </HydrateClient>
  );
}
