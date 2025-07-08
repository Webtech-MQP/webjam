"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sliders, ChevronDown, ChevronUp } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { useState, useMemo } from "react";
import type { RouterOutputs } from "@/trpc/react";
import { JamCard } from "@/components/jam-card";
import { format } from "date-fns";

interface JamFinderProps {
  projects: RouterOutputs["projects"]["getAll"];
}

export default function JamFinderClient({ projects }: JamFinderProps) {
  const [numberOfTeammates, setNumberOfTeammates] = useState(1);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [jamName, setJamName] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [activeFilters, setActiveFilters] = useState({
    numberOfTeammates: 1,
    jamName: "",
  });

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesName = activeFilters.jamName
        ? project.title
            ?.toLowerCase()
            .includes(activeFilters.jamName.toLowerCase())
        : true;
      const matchesGroupSize =
        activeFilters.numberOfTeammates > 0
          ? (project.usersToProjects?.length ?? 0) ===
            activeFilters.numberOfTeammates
          : true;

      return matchesName && matchesGroupSize;
    });
  }, [projects, activeFilters]);

  const handleSearch = () => {
    setActiveFilters({
      numberOfTeammates,
      jamName,
    });
  };

  const handleSliderChange = ([val]: number[]) => {
    if (val !== undefined) setNumberOfTeammates(val);
  };

  const dateLabel = dateRange.from
    ? dateRange.to
      ? `${format(dateRange.from, "MMM dd, yyyy")} – ${format(dateRange.to, "MMM dd, yyyy")}`
      : format(dateRange.from, "MMM dd, yyyy")
    : "Select date range";

  return (
    <>
      <h1 className="mb-2">WebJam Finder</h1>
      <div className="flex w-full gap-3">
        <Input
          className="w-64"
          placeholder="Enter a jam name"
          value={jamName}
          onChange={(e) => setJamName(e.target.value)}
        />
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between">
              {dateLabel ? dateLabel : "Select date range"}
              {isDatePickerOpen ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="center">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                } else {
                  setDateRange({ from: undefined, to: undefined });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              onClick={() => setIsSliderOpen(!isSliderOpen)}
            >
              {numberOfTeammates > 1
                ? `Group size: ${numberOfTeammates} `
                : "Group size "}
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
        <Button onClick={handleSearch}>Search</Button>
      </div>
      <div>
        Found {filteredProjects.length}{" "}
        {filteredProjects.length > 1 ? "jams" : "jam"}
      </div>
      {filteredProjects.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <JamCard
              key={project.id}
              name={project.title ?? "Untitled Jam"}
              numberOfTeammates={project.usersToProjects?.length ?? 0}
              imageUrl="https://placehold.co/150/png"
              tags={project.tagsToProjects?.map((tag) => tag.tag) ?? []}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4">No matching jams found.</div>
      )}
    </>
  );
}
