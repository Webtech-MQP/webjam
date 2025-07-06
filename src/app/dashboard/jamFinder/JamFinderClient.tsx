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
      <h1 className="mb text-2xl font-bold">Web Jam Finder</h1>
      <p className="mb-4 text-gray-600">
        Find a jam to join or create a new one!
      </p>
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
      <div className="mt-6">
        <h2 className="mb-4 text-xl font-semibold">Available Jams</h2>
        {projects.length > 0 ? (
          <ul className="space-y-4">
            {projects.map((project) => (
              <li
                key={project.id}
                className="rounded-md border p-4 transition-colors hover:bg-gray-800"
              >
                <h3 className="text-lg font-bold">{project.title}</h3>
                <p>{project.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No jams available at the moment.</p>
        )}
      </div>
    </>
  );
}
