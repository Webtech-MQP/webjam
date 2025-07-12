"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sliders, ChevronDown, ChevronUp } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { api, type RouterOutputs } from "@/trpc/react";
import { JamCard } from "@/components/jam-card";
import { format, set } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  jamName: z.string(),
  numberOfTeammates: z.array(z.number()).min(1).max(10),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  tags: z.set(z.string()).optional(),
});

type JamFinderForm = z.infer<typeof formSchema>;

export default function JamFinderClient() {
  const unsortedTagsQuery = api.tags.getAll.useQuery();
  const tagsQuery = unsortedTagsQuery.data
    ? unsortedTagsQuery.data.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      })
    : [];

  const form = useForm<JamFinderForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jamName: "",
      numberOfTeammates: [5],
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
      tags: new Set(),
    },
  });

  const [searchParams, setSearchParams] = useState<JamFinderForm | null>(null);

  function handleSubmit(values: JamFinderForm) {
    setSearchParams(values);
  }

  const filteredProjectsQuery = api.projects.findProjects.useQuery(
    {
      title: searchParams?.jamName ?? "",
      groupSize: searchParams?.numberOfTeammates[0],
      startDate: searchParams?.dateRange.from,
      endDate: searchParams?.dateRange.to,
      tags: searchParams?.tags,
    },
    {
      enabled: !!searchParams
    }
  );

  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  return (
    <>
      <h1 className="mb-2">WebJam Finder</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex w-full gap-3"
        >
          <FormField
            control={form.control}
            name="jamName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Enter a jam name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numberOfTeammates"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Popover open={isSliderOpen} onOpenChange={setIsSliderOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        {field.value
                          ? `Group size: ${field.value}`
                          : "Group size"}
                        {isSliderOpen ? <ChevronUp /> : <ChevronDown />}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="mb-2">
                        Number of teammates: {field.value}
                      </div>
                      <Slider
                        defaultValue={field.value ?? [5]}
                        max={10}
                        step={1}
                        onValueChange={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Popover
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-between">
                        {field.value.to || field.value.from
                          ? `${format(field.value.from, "MMM dd, yyyy")} – ${format(field.value.to, "MMM dd, yyyy")}`
                          : "Select date range"}
                        {isDatePickerOpen ? <ChevronUp /> : <ChevronDown />}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="center"
                    >
                      <Calendar
                        mode="range"
                        selected={field.value}
                        onSelect={(range) => {
                          if (range?.from && range?.to) {
                            field.onChange({ from: range.from, to: range.to });
                          } else {
                            field.onChange({ from: undefined, to: undefined });
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        Advanced filters <Sliders />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-h-60 overflow-y-auto">
                      <h5 className="mb-2">Select Tags</h5>
                      {tagsQuery.map((tag) => (
                        <Badge
                          className="mx-0.5 cursor-pointer"
                          variant={
                            field.value?.has(tag.id) ? "default" : "outline"
                          }
                          key={tag.id}
                          onClick={() => {
                            const newTags = new Set(field.value);
                            if (newTags.has(tag.id)) {
                              newTags.delete(tag.id);
                            } else {
                              newTags.add(tag.id);
                            }
                            field.onChange(newTags);
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Search</Button>
        </form>
      </Form>
      <div>
        {filteredProjectsQuery.isLoading && <div>Loading...</div>}
        {filteredProjectsQuery.data && filteredProjectsQuery.data.length > 0 ? (
          <>
            <div>
              Found {filteredProjectsQuery.data.length}{" "}
              {filteredProjectsQuery.data.length === 1 ? "jam" : "jams"}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjectsQuery.data.map((project) => (
                <JamCard
                  key={project.id}
                  name={project.title ?? "Untitled Jam"}
                  numberOfTeammates={project.usersToProjects?.length ?? 0}
                  imageUrl="https://placehold.co/150/png"
                  tags={project.tagsToProjects?.map((tag) => tag.tag) ?? []}
                />
              ))}
            </div>
          </>
        ) : (
          searchParams &&
          !filteredProjectsQuery.isLoading && (
            <div className="mt-4">No matching jams found.</div>
          )
        )}
      </div>
    </>
  );
}
