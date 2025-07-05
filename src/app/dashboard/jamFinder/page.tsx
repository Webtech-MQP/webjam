import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { DashboardCard } from "@/components/dashboard-card";

export default async function JamFinderPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/"); 
  }

  const projects = await api.projects.getAll();

    return (
        <DashboardCard>
            <h1 className="text-2xl font-bold mb">Jam Finder</h1>
            <p className="text-gray-600 mb-4">Find a jam to join or create a new one!</p>
        </DashboardCard>
    );
}