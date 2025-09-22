import { cn } from '@/lib/utils';

export function DashboardCard({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
    return (
        <div
            className={cn('space-y-2 rounded-lg border p-6 overflow-auto', className)}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
