import { SkeletonCard } from "@/components/ui/skeleton-card";

import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-ctl bg-line/70", className)}
      aria-hidden="true"
    />
  );
}

export { SkeletonCard };

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-80 max-w-full" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <SkeletonCard chart />
        </div>
        <div className="xl:col-span-4">
          <SkeletonCard chart />
        </div>
      </div>
    </div>
  );
}
