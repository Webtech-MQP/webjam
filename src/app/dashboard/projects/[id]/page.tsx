import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "../../_components/dashboard-card";
import { Clock, ExternalLink, Users } from "lucide-react";
import Image from "next/image";
import { GanttChart } from "@/app/_components/gantt-chart";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const session = await auth();

  if (!session?.user) {
    redirect("/"); 
  }
	const { id } = await params;

	const teammateData = [{
		name: "John Doe",
		role: "Developer",
		avatar: "https://placehold.co/150/png"
	}, {
		name: "Jane Smith",
		role: "Designer",
		avatar: "https://placehold.co/150/png"
	}, {
		name: "Alice Johnson",
		role: "Project Manager",
		avatar: "https://placehold.co/150/png"
	}, {
		name: "Bob Brown",
		role: "QA Engineer",
		avatar: "https://placehold.co/150/png"
	}]
	
	return <div className="flex flex-col p-4 gap-2">
		<DashboardCard>
			<h1>Patient Management Project {id}</h1>
			<div className="flex gap-2">
				<Badge className="bg-indigo-500"><Users /> 10 members</Badge>
				<Badge className="bg-indigo-500"><Clock />2 weeks remaining</Badge>
			</div>
			<div className="relative flex w-full gap-4">
				<div className="relative w-32 h-32 rounded-lg">
					<Image src="https://placehold.co/150/png" alt="Project Image" fill objectFit="contain" className="rounded" />
					<a target="_blank" href="https://example.com" className="bg-black/50 hover:bg-black/70 w-full h-full absolute flex items-center group"><ExternalLink className="mx-auto group-hover:stroke-primary"/></a>
				</div>
				<div className="flex-1">
					<GanttChart
						sections={[
							{name:"Week 1", color:"#e8871e", start:0, end:7, header:true},
							{name:"Week 2", color:"#e8871e", start:7, end:14, header:true},
							{name:"Week 3", color:"#e8871e", start:14, end:21, header:true},
							{name:"Week 4", color:"#e8871e", start:21, end:28, header:true},
							{name:"Week 5", color:"#e8871e", start:28, end:35, header:true},
							{name:"Meet your teammates", color:"#404040", start:0, end:6},
							{name:"Code Stuff", color:"#6366f1", start:4, end:28},
						]}
						progressBar={10}
					/>
				</div>
			</div>
		</DashboardCard>
		<DashboardCard>
			<h1>Teammates</h1>
			<div className="relative flex flex-col w-full gap-4">
				{teammateData.map((teammate, index) => (
					<div key={index} className="flex items-center gap-2">
						<div className="relative w-8 aspect-square">
							<Image src={teammate.avatar} alt={teammate.name} fill objectFit="cover" className="rounded-full" />
						</div>
							<p className="font-semibold">{teammate.name}</p>
							<p className="text-sm text-gray-500">{teammate.role}</p>
					</div>
				))}
			</div>
		</DashboardCard>
		<div className="flex gap-2 w-full">
		<DashboardCard className="flex-1">
			<h1>Deployment</h1>
			
		</DashboardCard>
		<DashboardCard className="flex-1">
			<h1>GitHub</h1>
			
		</DashboardCard>
		</div>
	</div>;
}