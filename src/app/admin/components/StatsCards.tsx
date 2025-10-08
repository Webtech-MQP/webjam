'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Activity, AlertTriangle } from 'lucide-react';

interface StatsCardsProps {
    projectSubmissionsCount: number;
    activeReportsCount: number;
    todaysActivityCount: number;
}

export function StatsCards({ projectSubmissionsCount, activeReportsCount, todaysActivityCount }: StatsCardsProps) {
    return (
        <>
            <Card className=" bg-primary/5 dark:bg-orange-950/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Active Reports</p>
                            <p className="text-3xl font-bold">{activeReportsCount}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-400/10 text-orange-400">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-green-200/20 dark:bg-green-950/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-950 dark:text-green-200">Today&#39;s Activity</p>
                            <p className="text-3xl font-bold text-foreground">{todaysActivityCount}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-200/20 dark:bg-green-900/30 dark:text-green-400">
                            <Activity className="w-6 h-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
