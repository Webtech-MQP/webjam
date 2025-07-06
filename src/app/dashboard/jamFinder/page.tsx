import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { DashboardCard } from "@/components/dashboard-card";
import JamFinderClient from "./JamFinderClient";

export default async function JamFinderPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const projects = await api.projects.getAll();

  return (
    <DashboardCard>
      <JamFinderClient projects={projects} />
    </DashboardCard>
  );
}
