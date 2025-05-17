import { Skeleton } from "@/components/ui/skeleton"

export function PromptCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 h-full flex flex-col justify-between">
      <div> {/* Group for title and description to allow footer to be at bottom if card is taller */} 
        {/* Title Skeleton (approximates h3, font-medium, mb-2) */}
        <Skeleton className="h-5 w-3/5 mb-2" />

        {/* Description Skeletons (approximates p, text-sm, line-clamp-2, mb-3) */}
        <Skeleton className="h-4 w-full mb-1.5" /> {/* line 1 of description */}
        <Skeleton className="h-4 w-5/6 mb-3" />   {/* line 2 of description */}
      </div>

      {/* Footer Area Skeleton (approximates div, flex justify-between items-center) */}
      <div className="flex justify-between items-center mt-auto"> {/* mt-auto pushes to bottom if content above is short */}
        {/* Tag Skeleton (approximates span, text-xs, bg-blue-100 text-blue-700 px-2 py-1 rounded-full) */}
        <Skeleton className="h-6 w-16 rounded-full" />
        
        {/* Button Skeleton (approximates Button variant='outline' size='sm') */}
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  )
}

