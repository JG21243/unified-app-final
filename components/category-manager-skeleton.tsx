\
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryManagerSkeleton() {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-24" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex justify-end gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
