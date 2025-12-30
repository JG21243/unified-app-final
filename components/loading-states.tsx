import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText } from "lucide-react"

export function PromptsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
      
      {/* Cards grid skeleton */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PromptCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function PromptCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 h-full flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Title skeleton */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Description skeleton - 2 lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
        {/* Category tag skeleton */}
        <Skeleton className="h-6 w-20 rounded-full" />
        
        {/* Action button skeleton */}
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  )
}

export function EmptyPromptsState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-muted/20 min-h-[400px]">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h2 className="text-xl sm:text-2xl font-semibold mb-3">
        No prompts found
      </h2>
      
      <p className="text-muted-foreground max-w-md text-sm sm:text-base mb-6">
        Get started by creating a new prompt for your legal AI workflows. 
        You can organize them by categories and easily search through them.
      </p>
      
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/prompts/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Create Your First Prompt
          </Link>

          <Link
            href="/categories"
            className="inline-flex items-center gap-2 border border-border px-4 py-2 rounded-md font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Manage Categories
          </Link>
        </div>
    </div>
  )
}