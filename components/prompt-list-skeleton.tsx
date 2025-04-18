import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface PromptListSkeletonProps {
  viewMode?: "grid" | "list"
}

export function PromptListSkeleton({ viewMode = "grid" }: PromptListSkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="flex items-center p-3 border-border/60">
            <Skeleton className="h-4 w-4 mr-3 rounded-sm" />
            <Skeleton className="h-4 w-4 mr-3 rounded-full" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>

              <Skeleton className="h-4 w-full mt-1" />

              <div className="flex items-center gap-3 mt-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="h-full flex flex-col border-border/60">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-24 mt-2" />
          </CardHeader>
          <CardContent className="flex-grow px-4 pb-0">
            <div className="space-y-3">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-24 w-full rounded-md" />

              <div className="flex gap-2 mt-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 mt-auto">
            <div className="flex gap-2 w-full">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

