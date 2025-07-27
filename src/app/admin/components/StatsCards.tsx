'use client';

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, FileText, Activity } from "lucide-react";

interface StatsCardsProps {
    projectSubmissionsCount: number;
    activeReportsCount: number;
    todaysActivityCount: number;
}

export function StatsCards({ projectSubmissionsCount, activeReportsCount, todaysActivityCount }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-gray-700 bg-orange-950/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Pending Reviews</p>
                            <p className="text-3xl font-bold text-white">{projectSubmissionsCount}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-400/10 text-orange-400">
                            <FileText className="w-6 h-6"/>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-700 bg-orange-950/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Active Reports</p>
                            <p className="text-3xl font-bold text-white">{activeReportsCount}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-orange-400/10 text-orange-400">
                            <AlertTriangle className="w-6 h-6"/>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-700 bg-green-950/20">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Today&#39;s Activity</p>
                            <p className="text-3xl font-bold text-white">{todaysActivityCount}</p>
                        </div>
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-900/30 text-green-400">
                            <Activity className="w-6 h-6"/>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
