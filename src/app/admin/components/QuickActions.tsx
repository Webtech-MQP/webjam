'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Flag, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import AdminCreateEditProject from './create-edit-project';

export function QuickActions() {
    return (
        <Card className="bg-stone-950 border-b border-gray-700">
            <CardHeader>
                <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <AdminCreateEditProject projectId={undefined} />
                <Button asChild className="w-full justify-start rounded-lg border-0 bg-orange-600/20 text-orange-400 hover:bg-orange-500/50 px-3 py-2">
                    <Link href="/admin/submissions">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="w-4 h-4"/>
                        </span>
                        Review Submissions
                    </Link>
                </Button>
                <Button asChild className="w-full justify-start rounded-lg border-0 bg-orange-600/20 text-orange-400 hover:bg-orange-500/50 px-3 py-2">
                    <Link href="/admin/reports">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center mr-3">
                            <Flag className="w-4 h-4"/>
                        </span>
                        Handle Reports
                    </Link>
                </Button>
                <Button asChild className="w-full justify-start rounded-lg border-0 bg-green-900 text-green-400 hover:bg-green-800 hover:text-green-500 px-3 py-2">
                    <Link href="/admin/users">
                        <Users className="w-4 h-4 mr-3"/>
                        User Management
                    </Link>
                </Button>
                <Button asChild className="w-full justify-start rounded-lg border-0 bg-green-900 text-green-400 hover:bg-green-800 hover:text-green-500 px-3 py-2">
                    <Link href="/admin/analytics">
                        <BarChart3 className="w-4 h-4 mr-3"/>
                        View Analytics
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
