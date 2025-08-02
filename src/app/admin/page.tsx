import { api } from '@/trpc/server';
import { ProjectSubmissions } from './components/ProjectSubmissions';
import { QuickActions } from './components/QuickActions';
import { ReportsList } from './components/ReportsList';
import { StatsCards } from './components/StatsCards';

export default async function AdminDashboardPage() {
    //Fetch project submissions and reports from backend
    const projectSubmissions = await api.projectSubmission.getPendingSubmissions();
    const reports = await api.reports.getAll();
    const activeReports = reports.filter((report) => !report.action);
    const projectSubmissionsToday = await api.projectSubmission.getTodayCount();
    const reportsToday = await api.reports.getTodayCount();

    return (
        //TODO: change background color
        <div className="min-h-screen ">
            <div className="bg-stone-950 border-b border-gray-700">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <StatsCards
                    projectSubmissionsCount={projectSubmissions.length}
                    activeReportsCount={activeReports.length}
                    todaysActivityCount={projectSubmissionsToday!.count + reportsToday!.count}
                />

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6 h-full">
                        <ReportsList reports={activeReports} />
                    </div>

                    <div className="space-y-6 h-full">
                        <QuickActions />
                    </div>
                </div>
            </div>
            <div className="p-6">
                <ProjectSubmissions submissions={projectSubmissions} />
            </div>
        </div>
    );
}
