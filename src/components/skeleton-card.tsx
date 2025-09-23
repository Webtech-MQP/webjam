import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function SkeletonCard({ className }: { className?: string }) {
    return <Skeleton className={cn('border-accent h-96 space-y-2 rounded-lg border p-6', className)} />;
}
