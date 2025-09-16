'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

export interface JudgingCriterion {
    criterion: string;
    weight: number;
}

interface JudgingCriteriaInputProps {
    title?: string;
    list?: JudgingCriterion[];
    onChange?: (criteria: JudgingCriterion[]) => void;
    allowCreate?: boolean;
    allowDelete?: boolean;
}

export const JudgingCriteriaInput = ({ title = 'Judging Criteria', list = [], onChange, allowCreate = true, allowDelete = true }: JudgingCriteriaInputProps) => {
    // TODO: Changing weights is a terrible UX
    const [newCriterion, setNewCriterion] = useState('');
    const [newWeight, setNewWeight] = useState(0);

    const totalWeight = list.reduce((sum, item) => sum + item.weight, 0);

    const addCriterion = () => {
        if (newCriterion.trim() && newWeight > 0) {
            const updatedList = [...list, { criterion: newCriterion.trim(), weight: newWeight }];
            onChange?.(updatedList);
            setNewCriterion('');
            setNewWeight(0);
        }
    };

    const removeCriterion = (index: number) => {
        const updatedList = list.filter((_, i) => i !== index);
        onChange?.(updatedList);
    };

    const updateCriterion = (index: number, field: 'criterion' | 'weight', value: string | number) => {
        const updatedList = list.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            }
            return item;
        });
        onChange?.(updatedList);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-base font-medium">{title}</Label>
                <div className={`text-sm font-medium ${totalWeight === 100 ? 'text-green-600' : totalWeight > 100 ? 'text-red-600' : 'text-orange-600'}`}>
                    Total Weight: {totalWeight}%{totalWeight !== 100 && <span className="text-xs text-muted-foreground ml-1">(should equal 100%)</span>}
                </div>
            </div>

            {/* Existing criteria */}
            <div className="space-y-3">
                {list.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 p-3 border rounded-lg bg-muted/20"
                    >
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">{index + 1}</div>
                        <div className="flex-1 space-y-2">
                            <Textarea
                                value={item.criterion}
                                onChange={(e) => updateCriterion(index, 'criterion', e.target.value)}
                                placeholder="Enter judging criterion"
                                className="min-h-[60px] resize-none"
                            />
                            <div className="flex items-center gap-2">
                                <Label
                                    htmlFor={`weight-${index}`}
                                    className="text-sm"
                                >
                                    Weight:
                                </Label>
                                <Input
                                    id={`weight-${index}`}
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={item.weight}
                                    onChange={(e) => updateCriterion(index, 'weight', parseInt(e.target.value) || 0)}
                                    className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">%</span>
                            </div>
                        </div>
                        {allowDelete && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCriterion(index)}
                                className="text-destructive hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add new criterion */}
            {allowCreate && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 space-y-3">
                    <div className="space-y-2">
                        <Label htmlFor="new-criterion">New Criterion</Label>
                        <Textarea
                            id="new-criterion"
                            value={newCriterion}
                            onChange={(e) => setNewCriterion(e.target.value)}
                            placeholder="Enter a new judging criterion..."
                            className="min-h-[60px] resize-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label
                            htmlFor="new-weight"
                            className="text-sm"
                        >
                            Weight:
                        </Label>
                        <Input
                            id="new-weight"
                            type="number"
                            min="0"
                            max="100"
                            value={newWeight}
                            onChange={(e) => setNewWeight(parseInt(e.target.value) || 0)}
                            className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                        <Button
                            type="button"
                            onClick={addCriterion}
                            disabled={!newCriterion.trim() || newWeight <= 0}
                            className="ml-auto"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Criterion
                        </Button>
                    </div>
                </div>
            )}

            {list.length === 0 && <div className="text-center text-muted-foreground text-sm py-4">No judging criteria defined yet. Add your first criterion above.</div>}
        </div>
    );
};
