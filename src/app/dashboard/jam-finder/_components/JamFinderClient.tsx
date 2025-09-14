'use client';

import { JamCard } from '@/components/jam-card';
import { SkeletonCard } from '@/components/skeleton-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { api } from '@/trpc/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Search, Sliders } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    jamName: z.string().min(1, 'Jam name is required'),
    numberOfTeammates: z.array(z.number()).min(1).max(10).optional(),
    dateRange: z
        .object({
            from: z.date().optional(),
            to: z.date().optional(),
        })
        .optional(),
    tags: z.array(z.string()).optional(),
});

type JamFinderForm = z.infer<typeof formSchema>;

export default function JamFinderClient() {
    const unsortedTagsQuery = api.projects.getAllTags.useQuery();
    const tagsQuery = unsortedTagsQuery.data
        ? unsortedTagsQuery.data.sort((a, b) => {
              if (!a.name) return 1;
              if (!b.name) return -1;
              return a.name.localeCompare(b.name);
          })
        : [];

    const form = useForm<JamFinderForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            jamName: '',
            numberOfTeammates: undefined,
            dateRange: undefined,
            tags: [],
        },
    });

    const [searchParams, setSearchParams] = useState<JamFinderForm | null>(null);
    const [isSliderOpen, setIsSliderOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    function handleSubmit(values: JamFinderForm) {
        setSearchParams(values);
    }

    const filteredProjectsQuery = api.projects.findProjects.useQuery(
        {
            title: searchParams?.jamName ?? '',
            groupSize: searchParams?.numberOfTeammates?.[0],
            from: searchParams?.dateRange?.from,
            to: searchParams?.dateRange?.to,
            tags: searchParams?.tags,
        },
        {
            enabled: !!searchParams,
        }
    );

    const projectsQuery = api.projects.getAll.useQuery();
    const projects = projectsQuery.data;

    return (
        <div className="flex h-full flex-col">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex w-full flex-wrap gap-3"
                >
                    <FormField
                        control={form.control}
                        name="jamName"
                        render={({ field }) => (
                            <FormItem className="w-84">
                                <FormControl>
                                    <Input
                                        placeholder="Enter a jam name"
                                        {...field}
                                    />
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
                                    <Popover
                                        open={isSliderOpen}
                                        onOpenChange={setIsSliderOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="flex w-52 items-center justify-between truncate"
                                            >
                                                <span className="truncate">{Array.isArray(field.value) ? `Group size: ${field.value[0]}` : 'Select group size'}</span>
                                                {isSliderOpen ? <ChevronUp /> : <ChevronDown />}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Slider
                                                defaultValue={field.value}
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
                                            <Button
                                                variant="outline"
                                                className="flex w-58 items-center justify-between truncate"
                                            >
                                                <span className="truncate">{field.value?.from && field.value?.to ? `${format(field.value.from, 'MMM dd, yyyy')} – ${format(field.value.to, 'MMM dd, yyyy')}` : 'Select start date range'}</span>
                                                {isDatePickerOpen ? <ChevronUp /> : <ChevronDown />}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto overflow-hidden p-0"
                                            align="center"
                                        >
                                            <Calendar
                                                mode="range"
                                                selected={{
                                                    from: field.value?.from,
                                                    to: field.value?.to,
                                                }}
                                                onSelect={(range) => {
                                                    if (range?.from && range?.to) {
                                                        field.onChange({ from: range.from, to: range.to });
                                                    } else {
                                                        field.onChange(undefined);
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
                                            {tagsQuery.map((tag) => {
                                                const isSelected = field.value?.includes(tag.id);
                                                return (
                                                    <Badge
                                                        className="mx-0.5 cursor-pointer"
                                                        variant={isSelected ? 'default' : 'outline'}
                                                        key={tag.id}
                                                        onClick={() => {
                                                            let newTags: string[] = [];
                                                            if (isSelected) {
                                                                newTags = (field.value ?? []).filter((id: string) => id !== tag.id);
                                                            } else {
                                                                newTags = [...(field.value ?? []), tag.id];
                                                            }
                                                            field.onChange(newTags);
                                                        }}
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                );
                                            })}
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">
                        Search <Search />
                    </Button>
                </form>
            </Form>
            <div className="mt-4 -mb-6 flex-1">
                {projectsQuery.isLoading && !searchParams && (
                    <div className="relative h-full">
                        <div className="absolute inset-0 overflow-y-clip pb-6">
                            <div className="grid grid-cols-1 gap-4 overflow-y-clip md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {!searchParams && (
                    <div className="relative h-full">
                        <div className="absolute inset-0 overflow-y-auto pb-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {projects?.map((project) => (
                                    <div key={project.id}>
                                        <Link href={`/dashboard/projects/${project.id}`}>
                                            <JamCard
                                                key={project.id}
                                                title={project.title ?? 'Untitled Jam'}
                                                startDateTime={project.startDateTime ?? new Date()}
                                                endDateTime={project.endDateTime ?? new Date()}
                                                numberOfTeammates={project.numberOfMembers}
                                                imageUrl={project.imageUrl ?? 'https://placehold.co/150/png'}
                                                tags={project.projectsToTags?.map((pt) => pt.tag) ?? []}
                                                onClick={() => {
                                                    setSelectedProject(project.id);
                                                    setIsModalOpen(true);
                                                }}
                                            />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {filteredProjectsQuery.isLoading && (
                    <div className="relative h-full">
                        <div className="absolute inset-0 overflow-y-auto pb-6">
                            <div>Searching for jams...</div>
                            <div className="mt-4 grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {filteredProjectsQuery.data && filteredProjectsQuery.data.length > 0 ? (
                    <div className="relative h-full">
                        <div className="absolute inset-0 overflow-y-auto pb-6">
                            <div>
                                Found {filteredProjectsQuery.data.length} {filteredProjectsQuery.data.length === 1 ? 'jam' : 'jams'}
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
                                {filteredProjectsQuery.data.map((project) => (
                                    <div key={project.id}>
                                        <Link href={`/dashboard/projects/${project.id}`}>
                                            <JamCard
                                                key={project.id}
                                                title={project.title ?? 'Untitled Jam'}
                                                startDateTime={project.startDateTime ?? new Date()}
                                                endDateTime={project.endDateTime ?? new Date()}
                                                numberOfTeammates={project.numberOfMembers}
                                                imageUrl={project.imageUrl ?? 'https://placehold.co/150/png'}
                                                tags={project.projectsToTags?.map((pt) => pt.tag) ?? []}
                                                onClick={() => {
                                                    setSelectedProject(project.id);
                                                    setIsModalOpen(true);
                                                }}
                                            />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    searchParams && !filteredProjectsQuery.isLoading && <div>No matching jams found.</div>
                )}
            </div>
        </div>
    );
}
