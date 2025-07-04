import { api } from "@/trpc/server";
import Image from "next/image";

type Props = {
  userId: Promise<string>;
};

export default function Page(params: Props) {
  // const users = api.user.getUsers();

  return (
    <div>
      {/* Banner */}
      <div>
        <div className="relative h-40 w-full">
          <Image
            src="https://placehold.co/100.png"
            alt="Profile picture"
            fill
          />
        </div>
        <div className="space-y-8 p-15">
          <div className="z-30 -mt-30">
            <Image
              src="https://placehold.co/100.png"
              className="relative z-20 box-content rounded-xl border-6 border-(--color-background)"
              alt="Profile picture"
              height={100}
              width={100}
            />
            <h1 className="mt-2">Ace Beattie</h1>
            <p>Joined 2025 ⋅ Really cool description</p>
          </div>
          <div>
            <h2>Jams</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
