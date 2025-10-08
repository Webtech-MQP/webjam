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
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCards
                        projectSubmissionsCount={projectSubmissions.length}
                        activeReportsCount={activeReports.length}
                        todaysActivityCount={projectSubmissionsToday!.count + reportsToday!.count}
                    />

                    <div className="space-y-6 h-full">
                        <QuickActions />
                    </div>
                </div>

                <div className="w-full">
                    <ReportsList reports={activeReports} />
                </div>
            </div>
            <div className="p-6">
                <ProjectSubmissions submissions={projectSubmissions} />
            </div>
        </div>
    );
}
