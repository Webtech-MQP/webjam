'use client';

import { ProjectCard } from '@/components/project-card';
import { ProjectDetail } from '@/components/project-detail';
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
import { AnimatePresence, motion } from 'motion/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    jamName: z.string().min(0, 'Jam name is required'),
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

    const [finderParams, setFinderParams] = useState<JamFinderForm | null>(null);
    const [isSliderOpen, setIsSliderOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    function handleSubmit(values: JamFinderForm) {
        console.log(values);
        if (values.jamName === '' && (values.numberOfTeammates == undefined || values.numberOfTeammates.length == 0) && (values.dateRange == undefined || (values.dateRange?.to == undefined && values.dateRange?.from == undefined)) && (values.tags == undefined || values.tags?.length == 0)) {
            setFinderParams(null);
        } else {
            setFinderParams(values);
        }
    }

    const filteredProjectsQuery = api.projects.findProjects.useQuery(
        {
            title: finderParams?.jamName ?? '',
            groupSize: finderParams?.numberOfTeammates?.[0],
            from: finderParams?.dateRange?.from,
            to: finderParams?.dateRange?.to,
            tags: finderParams?.tags,
        },
        {
            enabled: !!finderParams,
        }
    );

    const projectsQuery = api.projects.getAll.useQuery();
    const projects = projectsQuery.data;

    const searchParams = useSearchParams();
    const activeProjectId = searchParams.get('project-id');

    const router = useRouter();
    const pathname = usePathname();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);

            return params.toString();
        },
        [searchParams]
    );

    const removeQueryParam = useCallback(
        (name: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete(name);

            return params.toString();
        },
        [searchParams]
    );

    const handleCloseProject = useCallback(() => {
        const newUrl = pathname + '?' + removeQueryParam('project-id');
        window.history.pushState({}, '', newUrl.endsWith('?') ? pathname : newUrl);
        setSelectedProject(null);
        setIsModalOpen(false);
    }, [pathname, removeQueryParam]);

    // Handle browser navigation and initial URL state
    useEffect(() => {
        const handlePopState = () => {
            const currentParams = new URLSearchParams(window.location.search);
            const projectId = currentParams.get('project-id');

            if (projectId) {
                setSelectedProject(projectId);
                setIsModalOpen(true);
            } else {
                setSelectedProject(null);
                setIsModalOpen(false);
            }
        };

        // Handle initial load
        if (activeProjectId) {
            setSelectedProject(activeProjectId);
            setIsModalOpen(true);
        }

        // Listen for browser navigation
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [activeProjectId]);

    return (
        <div className="h-full gap-4">
            <div className="min-w-full">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="flex w-full flex-wrap gap-3"
                    >
                        <FormField
                            control={form.control}
                            name="jamName"
                            render={({ field }) => (
                                <FormItem className="min-w-64 flex-1">
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
                                <FormItem className="flex-1 min-w-32">
                                    <FormControl>
                                        <Popover
                                            open={isSliderOpen}
                                            onOpenChange={setIsSliderOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="flex w-full items-center justify-between truncate"
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
                                <FormItem className="min-w-32 flex-1">
                                    <FormControl>
                                        <Popover
                                            open={isDatePickerOpen}
                                            onOpenChange={setIsDatePickerOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="flex w-full items-center justify-between truncate"
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
                                <FormItem className="flex-1">
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
                        <Button
                            className="flex-1"
                            type="submit"
                        >
                            Search <Search />
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 -mb-6 flex-1">
                    {projectsQuery.isLoading && !finderParams && (
                        <div className="relative h-full">
                            <div className="absolute inset-0 overflow-y-auto pb-6">
                                <div className="mt-4 grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <SkeletonCard key={i} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {!finderParams && (
                        <div className="relative h-full">
                            <div className="overflow-y-auto pb-6">
                                <div className="mt-4 grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
                                    {projects?.map((project) => (
                                        <div
                                            className="min-w-64 max-w-128"
                                            key={project.id}
                                        >
                                            <ProjectCard
                                                key={project.id}
                                                title={project.title ?? 'Untitled Jam'}
                                                startDateTime={project.startDateTime ?? new Date()}
                                                endDateTime={project.endDateTime ?? new Date()}
                                                numberOfTeammates={project.numberOfMembers}
                                                imageUrl={project.imageUrl ?? 'https://placehold.co/150/png'}
                                                tags={project.projectsToTags?.map((pt) => pt.tag) ?? []}
                                                onClick={() => {
                                                    const newUrl = pathname + '?' + createQueryString('project-id', project.id);
                                                    window.history.pushState({}, '', newUrl);
                                                }}
                                            />
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
                            <div className="overflow-y-auto pb-6">
                                <div className="mt-4 grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3">
                                    {filteredProjectsQuery.data?.map((project) => (
                                        <div
                                            className="min-w-64 max-w-128"
                                            key={project.id}
                                        >
                                            <ProjectCard
                                                key={project.id}
                                                title={project.title ?? 'Untitled Jam'}
                                                startDateTime={project.startDateTime ?? new Date()}
                                                endDateTime={project.endDateTime ?? new Date()}
                                                numberOfTeammates={project.numberOfMembers}
                                                imageUrl={project.imageUrl ?? 'https://placehold.co/150/png'}
                                                tags={project.projectsToTags?.map((pt) => pt.tag) ?? []}
                                                onClick={() => {
                                                    const newUrl = pathname + '?' + createQueryString('project-id', project.id);
                                                    window.history.pushState({}, '', newUrl);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        finderParams && !filteredProjectsQuery.isLoading && <div>No matching jams found.</div>
                    )}
                </div>
            </div>
            {activeProjectId &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div className="fixed inset-0 z-[200]">
                        <div className="fixed top-2 right-2 w-[40vw] h-[calc(100vh-16px)]">
                            <AnimatePresence>
                                <motion.div
                                    className="h-full transform"
                                    initial={{ translateX: '100%' }}
                                    animate={{ translateX: 0 }}
                                    exit={{ translateX: '100%' }}
                                    transition={{
                                        duration: 0.3,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <ProjectDetail
                                        onClose={handleCloseProject}
                                        id={activeProjectId}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}
