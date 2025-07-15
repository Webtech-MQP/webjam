import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/dashboard-card";
import { Clock, ExternalLink, Users } from "lucide-react";
import Image from "next/image";
import { GanttChart } from "@/features/time-tracking/components/gantt-chart";
import { api } from "@/trpc/server";
// import { CommitChart } from "@/features/github-integration/components/commit-chart";
// import { DeploymentChart } from "@/features/aws-integration/components/deployment-chart";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }
  const { id } = await params;

  const project = await api.projects.getOne({ id });

  if (!project) return <div>Not found!</div>;

  return (
    <div className="flex flex-col gap-2 p-4">
      <DashboardCard>
        <h1>{project.title}</h1>
        <div className="flex gap-2">
          <Badge className="bg-indigo-500">
            <Users /> {project.candidateProfilesToProjects.length} members
          </Badge>
          <Badge className="bg-indigo-500">
            <Clock /> {project.deadline?.toLocaleDateString()}
          </Badge>
        </div>
        <div className="relative flex w-full gap-4">
          <div className="relative h-32 w-32 rounded-lg">
            <Image
              src="https://placehold.co/150/png"
              alt="Project Image"
              fill
              objectFit="contain"
              className="rounded"
            />
            <a
              target="_blank"
              href="https://example.com"
              className="group absolute flex h-full w-full items-center bg-black/50 hover:bg-black/70"
            >
              <ExternalLink className="group-hover:stroke-primary mx-auto" />
            </a>
          </div>
          <div className="flex-1">
            <GanttChart
              sections={[
                {
                  name: "Week 1",
                  color: "#e8871e",
                  start: 0,
                  end: 7,
                  header: true,
                },
                {
                  name: "Week 2",
                  color: "#e8871e",
                  start: 7,
                  end: 14,
                  header: true,
                },
                {
                  name: "Week 3",
                  color: "#e8871e",
                  start: 14,
                  end: 21,
                  header: true,
                },
                {
                  name: "Week 4",
                  color: "#e8871e",
                  start: 21,
                  end: 28,
                  header: true,
                },
                {
                  name: "Week 5",
                  color: "#e8871e",
                  start: 28,
                  end: 35,
                  header: true,
                },
                {
                  name: "Meet your teammates",
                  color: "#404040",
                  start: 0,
                  end: 6,
                },
                { name: "Code Stuff", color: "#6366f1", start: 4, end: 28 },
              ]}
              progressBar={10}
            />
          </div>
        </div>
      </DashboardCard>
      <DashboardCard>
        <h1>Teammates</h1>
        <div className="relative flex w-full flex-col gap-4">
          {project.candidateProfilesToProjects.map(
            (projectCandidate, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="relative aspect-square w-8">
                  <Image
                    src={projectCandidate.candidateProfile.imageURL ?? ""}
                    alt={projectCandidate.candidateProfile.displayName}
                    fill
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
                <p className="font-semibold">
                  {projectCandidate.candidateProfile.displayName ??
                    projectCandidate.candidateProfile.displayName}
                </p>
                <p className="text-sm text-gray-500">Placeholder</p>
              </div>
            ),
          )}
        </div>
      </DashboardCard>
      <div className="flex w-full gap-2">
        <DashboardCard className="flex-1">
          <h1>Deployment</h1>
        </DashboardCard>
        <DashboardCard className="flex-1">
          <h1>GitHub</h1>
        </DashboardCard>
      </div>
    </div>
  );
}
