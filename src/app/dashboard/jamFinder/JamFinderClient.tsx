"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sliders, ChevronDown, ChevronUp } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import type { RouterOutputs } from "@/trpc/react";
import { JamCard } from "@/components/jam-card";

interface JamFinderProps {
  projects: RouterOutputs["projects"]["getAll"];
}

export default function JamFinderClient({ projects }: JamFinderProps) {
  const [numberOfTeammates, setNumberOfTeammates] = useState(1);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const handleSliderChange = ([val]: number[]) => {
    if (val !== undefined) setNumberOfTeammates(val);
  };

  return (
    <>
      <h1 className="mb font-bold">Web Jam Finder</h1>
      <div className="flex gap-3">
        <Input placeholder="Enter a jam name" />
        <Input placeholder="Date picker" />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              onClick={() => setIsSliderOpen(!isSliderOpen)}
            >
              {numberOfTeammates > 1
                ? `Teammates: ${numberOfTeammates} `
                : "Number of teammates "}
              {isSliderOpen ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="mb-2">Number of teammates: {numberOfTeammates}</div>
            <Slider
              defaultValue={[numberOfTeammates]}
              max={10}
              step={1}
              onValueChange={handleSliderChange}
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              Advanced filters <Sliders />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div>Filters and stuff</div>
          </PopoverContent>
        </Popover>
        <Button>Search</Button>
      </div>
      <div>
        Found {projects.length} {projects.length > 1 ? "jams" : "jam"}
      </div>
        <JamCard
        name="Patient Management System"
        startDate="12/12/2023"
        numberOfTeammates={5}
        imageUrl="https://placehold.co/150/png"
        tags={projects[0]?.tagsToProjects.map((t) => t.tag)}
        className="w-1/3"
      />
    </>
  );
}
