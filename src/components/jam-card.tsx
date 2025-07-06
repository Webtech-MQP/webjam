import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { DashboardCard } from "./dashboard-card";
import type { RouterOutputs } from "@/trpc/react";
import { Badge } from "./ui/badge";
import Image from "next/image";

type Tag =
  RouterOutputs["projects"]["getAll"][number]["tagsToProjects"][number]["tag"];

interface JamCardProps {
  name: string;
  startDate: string;
  endDate?: string;
  numberOfTeammates: number;
  imageUrl: string;
  rating?: number;
  numberOfRatings?: number;
  tags?: Tag[];
  className?: string;
}

export function JamCard({
  name,
  startDate,
  endDate,
  numberOfTeammates,
  imageUrl,
  rating,
  numberOfRatings,
  tags,
  className,
}: JamCardProps) {
  return (
    <DashboardCard
      className={cn(
        "flex h-96 flex-col items-start overflow-hidden px-0 pb-0",
        className,
      )}
    >
      <div className="relative -mt-6 mb-0 flex-1 w-full rounded-t-lg">
        <Image
          src={imageUrl}
          alt={`${name} image`}
          fill
          className="object-cover"
        />
      </div>
      <div className="hover:bg-primary group flex flex-0 w-full flex-col items-start rounded-b-lg p-3 transition-colors duration-300">
        <div className="flex w-full items-center justify-between">
          <h3 className="mb-2">{name}</h3>
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="inline h-4 w-4" />
              {rating} {numberOfRatings ? `(${numberOfRatings})` : ""}
            </div>
          )}
        </div>
        <p className="text-sm">
          {startDate} - {endDate ? endDate : "Present"} • {numberOfTeammates}{" "}
          members
        </p>
        {tags && tags.length > 0 && (
          <div className="mt-2 flex gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                className="transition group-hover:border-white"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
