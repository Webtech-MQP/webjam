import { cn } from "@/lib/utils";

export function DashboardCard({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn("border-accent space-y-2 rounded-lg border p-6", className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
