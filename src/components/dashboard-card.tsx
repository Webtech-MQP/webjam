import { cn } from "@/lib/utils";

export function DashboardCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("border-accent space-y-2 rounded-lg border p-6", className)}
    >
      {children}
    </div>
  );
}
