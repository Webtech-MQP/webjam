import { api } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Flag, Users, BarChart3, Activity} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  //Fetch project submissions from backend
  const projectSubmissions = await api.projectSubmission.getAll();

  //Mock data
  const pendingReports = [
    { id: "1", type: "Inappropriate Content", reporter: "Sally Sushi", reportedUser: "User123", reportedAt: "1 hour ago", priority: "high" },
    { id: "2", type: "Spam", reporter: "Admin", reportedUser: "SpamBot", reportedAt: "3 hours ago", priority: "medium" },
    { id: "3", type: "Harassment", reporter: "Someone", reportedUser: "User456", reportedAt: "6 hours ago", priority: "high" },
  ];


  return (
    <div className="min-h-screen bg-black">

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-gray-700 bg-orange-950/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Pending Reviews</p>
                  <p className="text-3xl font-bold text-white">{projectSubmissions.length}</p>
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
                  <p className="text-3xl font-bold text-white">_</p>
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
                  <p className="text-3xl font-bold text-white">_</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-900/30 text-green-400">
                  <Activity className="w-6 h-6"/>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                idk
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-stone-950 border-b border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">Priority Alerts</CardTitle>
                  <span className="bg-orange-500/20 text-orange-400 border-0 text-xs px-2 py-1 rounded-lg flex items-center justify-center">
                    {pendingReports.filter(r => r.priority === 'high').length} High Priority
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingReports.filter(r => r.priority === 'high').map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 rounded-lg bg-orange-900/20">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-400/10">
                            <Flag className="w-4 h-4 text-orange-400" />
                          </span>
                          <span className="font-medium text-white">{report.type}</span>
                          <span className="bg-orange-900/20 text-orange-400 border-0 text-xs px-2 py-1 rounded-lg flex items-center justify-center">HIGH</span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Reported by {report.reporter} • Against: {report.reportedUser}
                        </p>
                        <p className="text-xs text-gray-400">{report.reportedAt}</p>
                      </div>
                      <Button size="sm" className="rounded-lg border-0 bg-orange-600/10 text-orange-400 hover:bg-orange-500/50 px-3 py-1">
                        Investigate
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-stone-950 border-b border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">Pending Submissions</CardTitle>
                  <Button variant="outline" size="sm" className="rounded-lg border-0 bg-orange-600/10 text-orange-400 hover:bg-orange-500/50 px-3 py-1">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/40">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{submission.project?.title ?? "Untitled Project"}</h4>
                          <span className="bg-orange-200/10 text-orange-400 border-0 text-xs px-2 py-1 rounded-lg flex items-center justify-center">{submission.status}</span>
                        </div>
                        <p className="text-sm text-gray-400">
                          Reviewed by {submission.reviewedByAdmin?.displayName ?? "Unknown"} • {submission.submittedOn ? new Date(submission.submittedOn).toLocaleString() : "Unknown date"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-lg border-0 bg-orange-600/10 text-orange-400 hover:bg-orange-500/50 px-3 py-1">
                          Review
                        </Button>
                        <Button size="sm" className="rounded-lg border-0 bg-green-900 text-green-400 hover:bg-green-800 px-3 py-1">
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-stone-950 border-b border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start rounded-lg border-0 bg-orange-600/20 text-orange-400 hover:bg-orange-500/50 px-3 py-2">
                  <Link href="">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="w-4 h-4"/>
                    </span>
                    Review Submissions
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start rounded-lg border-0 bg-orange-600/20 text-orange-400 hover:bg-orange-500/50 px-3 py-2">
                  <Link href="">
                    <span className="w-6 h-6 rounded-lg flex items-center justify-center mr-3">
                      <Flag className="w-4 h-4"/>
                    </span>
                    Handle Reports
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start rounded-lg border-0 bg-green-900 text-green-400 hover:bg-green-800 hover:text-green-500 px-3 py-2">
                  <Link href="">
                    <Users className="w-4 h-4 mr-3"/>
                    User Management
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start rounded-lg border-0 bg-green-900 text-green-400 hover:bg-green-800 hover:text-green-500 px-3 py-2">
                  <Link href="">
                    <BarChart3 className="w-4 h-4 mr-3"/>
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-stone-950 border-b border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 