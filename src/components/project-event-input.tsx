'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { GanttChart } from '@/features/time-tracking/components/gantt-chart';
import { EyeIcon, Plus, Trash } from 'lucide-react';
import { useState } from 'react';

export interface ProjectEvent {
    title: string;
    startTime: Date;
    endTime: Date;
    isHeader: boolean;
}

interface ProjectEventInputProps {
    title?: string;
    list?: ProjectEvent[];
    onChange?: (events: ProjectEvent[]) => void;
    allowCreate?: boolean;
    allowDelete?: boolean;
}

function toDateInputValue(date: Date): string {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().split('T')[0]!;
}
function parseLocalDateString(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year!, month! - 1, day);
}

export const ProjectEventInput = ({ title = 'Project Timeline Events', list = [], onChange, allowCreate = true, allowDelete = true }: ProjectEventInputProps) => {
    const [newEvent, setNewEvent] = useState<ProjectEvent>({
        title: '',
        startTime: new Date(),
        endTime: new Date(),
        isHeader: false,
    });

    const addEvent = () => {
        if (newEvent.title.trim() && newEvent.startTime && newEvent.endTime) {
            const updatedList = [...list, newEvent];
            onChange?.(updatedList);
            setNewEvent({ title: '', startTime: new Date(), endTime: new Date(), isHeader: false });
        }
    };

    const removeEvent = (index: number) => {
        const updatedList = list.filter((_, i) => i !== index);
        onChange?.(updatedList);
    };

    const updateEvent = <K extends keyof ProjectEvent>(index: number, field: K, value: ProjectEvent[K]) => {
        const updatedList = list.map((event, i) => {
            if (i === index) {
                return { ...event, [field]: value };
            }
            return event;
        });
        onChange?.(updatedList);
    };

    const earliestStartTime = list ? Math.min(...list.map((e) => e.startTime.getTime())) : null;
    const sections = list
        ? list.map((event) => ({
              start: (event.startTime.getTime() - earliestStartTime!) / (1000 * 60 * 60 * 24),
              end: (event.endTime.getTime() - earliestStartTime!) / (1000 * 60 * 60 * 24),
              name: event.title,
              color: event.isHeader ? '#e8871e' : '#6366f1',
              header: event.isHeader,
          }))
        : null;
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label>{title}</Label>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            size="sm"
                            disabled={!sections || sections.length === 0}
                        >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Preview
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-2/3 w-screen min-w-3/5 overflow-y-scroll">
                        <DialogHeader>
                            <DialogTitle>Project Timeline</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 h-full overflow-auto">
                            <GanttChart
                                sections={sections!}
                                progressBar={0}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
                {list.map((event, index) => (
                    <div
                        key={index}
                        className="flex flex-col gap-2 p-2 border rounded-lg bg-muted/20 relative"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">{index + 1}</div>
                            <div className="flex flex-col flex-1">
                                <Input
                                    id={`title-${index}`}
                                    value={event.title}
                                    onChange={(e) => updateEvent(index, 'title', e.target.value)}
                                    placeholder="Event title"
                                />
                            </div>
                            <div className="flex flex-col">
                                <Input
                                    id={`start-${index}`}
                                    type="date"
                                    value={toDateInputValue(event.startTime)}
                                    onChange={(e) => updateEvent(index, 'startTime', parseLocalDateString(e.target.value))}
                                />
                            </div>
                            <div className="flex flex-col">
                                <Input
                                    id={`end-${index}`}
                                    type="date"
                                    value={toDateInputValue(event.endTime)}
                                    onChange={(e) => updateEvent(index, 'endTime', parseLocalDateString(e.target.value))}
                                />
                            </div>
                            <div className="flex flex-col items-center">
                                <Switch
                                    id={`header-${index}`}
                                    checked={event.isHeader}
                                    onCheckedChange={(checked) => updateEvent(index, 'isHeader', !!checked)}
                                    className="[&[data-state=unchecked]]:!bg-indigo-500"
                                />
                            </div>

                            {allowDelete && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeEvent(index)}
                                    className="text-destructive hover:text-destructive ml-auto mt-1"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* New Event */}
            {allowCreate && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <Label
                                htmlFor="new-title"
                                className="text-xs"
                            >
                                Title
                            </Label>
                            <Input
                                id="new-title"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                placeholder="Title"
                            />
                        </div>
                        <div className="flex flex-col">
                            <Label
                                htmlFor="new-start"
                                className="text-xs"
                            >
                                Start
                            </Label>
                            <Input
                                id="new-start"
                                type="date"
                                value={toDateInputValue(newEvent.startTime)}
                                onChange={(e) => setNewEvent({ ...newEvent, startTime: parseLocalDateString(e.target.value) })}
                            />
                        </div>
                        <div className="flex flex-col">
                            <Label
                                htmlFor="new-end"
                                className="text-xs"
                            >
                                End
                            </Label>
                            <Input
                                id="new-end"
                                type="date"
                                value={toDateInputValue(newEvent.endTime)}
                                onChange={(e) => setNewEvent({ ...newEvent, endTime: parseLocalDateString(e.target.value) })}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label
                                htmlFor="new-header"
                                className="text-xs"
                            >
                                Header
                            </Label>
                            <Switch
                                id="new-header"
                                checked={newEvent.isHeader}
                                onCheckedChange={(checked) => setNewEvent({ ...newEvent, isHeader: !!checked })}
                                className="data-[state=unchecked]:bg-indigo-500"
                            />
                        </div>
                        <div className="ml-auto">
                            <Button
                                type="button"
                                onClick={addEvent}
                                disabled={!newEvent.title.trim() || !newEvent.startTime || !newEvent.endTime}
                                className="h-8 px-3 py-1 text-sm"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Event
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {list.length === 0 && <div className="text-center text-muted-foreground text-sm py-4">No events defined yet. Add your first event above.</div>}
        </div>
    );
};
