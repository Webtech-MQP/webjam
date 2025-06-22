import { cn } from "@/lib/utils";

export function DashboardCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
	 <div className={cn("rounded-lg p-6 border border-accent space-y-2", className)}>
		{children}
	 </div>
  );
}