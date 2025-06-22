import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "../../_components/dashboard-card";
import { Clock, ExternalLink, Users } from "lucide-react";
import Image from "next/image";
import { GanttChart } from "@/app/_components/gantt-chart";
import { api } from "@/trpc/server";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const teammates = await api.projects.getOne({ id });

  if (!teammates) return <div>Not found!</div>;

  return (
    <div className="flex flex-col gap-2 p-4">
      <DashboardCard>
        <h1>{teammates.title}</h1>
        <div className="flex gap-2">
          <Badge className="bg-indigo-500">
            <Users /> {teammates.usersToProjects.length} members
          </Badge>
          <Badge className="bg-indigo-500">
            <Clock /> {teammates.deadline?.toLocaleDateString()}
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
          {teammates.usersToProjects.map((teammate, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="relative aspect-square w-8">
                <Image
                  src={teammate.user.image ?? ""}
                  alt={teammate.user.name ?? teammate.user.email}
                  fill
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
              <p className="font-semibold">
                {teammate.user.name ?? teammate.user.email}
              </p>
              <p className="text-sm text-gray-500">Placeholder</p>
            </div>
          ))}
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
