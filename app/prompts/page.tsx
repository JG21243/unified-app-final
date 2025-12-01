import { Suspense } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

import type { PromptStatus } from "@/app/actions"
import { getPrompts } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyPromptsState, PromptCardSkeleton } from "@/components/loading-states"
import { Alert, AlertDescription } from "@/components/ui/alert"

type PromptFilters = {
  status?: PromptStatus
  category?: string
  owner?: string
}

async function PromptList({ filters }: { filters?: PromptFilters }) {
  try {
    const { prompts, error } = await getPrompts(filters)

    const uniqueCategories = Array.from(new Set(prompts.map((prompt) => prompt.category || "Uncategorized")))
    const uniqueOwners = Array.from(new Set(prompts.map((prompt) => prompt.owner || "unassigned")))

    if (error) {
      return (
        <Alert className="mt-6" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <strong>Database Error:</strong> {error}
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer font-medium hover:underline">
                  Show database setup instructions
                </summary>
                <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-md overflow-x-auto text-xs font-mono">
                  <pre>{`CREATE TABLE IF NOT EXISTS legalprompt (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  category VARCHAR(100),
  "systemMessage" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}</pre>
                </div>
              </details>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    if (!prompts || prompts.length === 0) {
      return <EmptyPromptsState />;
    }

    return (
      <div className="mt-6 space-y-4">
        <form className="grid grid-cols-1 gap-3 rounded-lg border p-4 bg-card sm:grid-cols-2 lg:grid-cols-4" method="get">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={filters?.status || ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="review">In review</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={filters?.category || ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="owner">
              Owner
            </label>
            <select
              id="owner"
              name="owner"
              defaultValue={filters?.owner || ""}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {uniqueOwners.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end justify-end">
            <Button type="submit" className="w-full sm:w-auto">
              Apply filters
            </Button>
          </div>
        </form>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => {
            const hasPublished = (prompt.publishedVersion ?? 0) > 0
            const latestIsPublished = prompt.latestVersion === prompt.publishedVersion && hasPublished
            const badgeLabel = hasPublished
              ? latestIsPublished
                ? `Latest published v${prompt.publishedVersion}`
                : `Published v${prompt.publishedVersion}`
              : "Draft"

            return (
              <div
                key={prompt.id}
                className="group bg-card rounded-lg border p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                      {prompt.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {prompt.category || "Uncategorized"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {prompt.owner || "unassigned"}
                      </Badge>
                    </div>
                  </div>
                  <Badge className="text-xs capitalize" variant={prompt.status === "published" ? "default" : "secondary"}>
                    {prompt.status || "draft"}
                  </Badge>
                </div>

                <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {prompt.prompt.startsWith("# ") ? prompt.prompt.substring(2) : prompt.prompt}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{badgeLabel}</Badge>
                  <Badge variant="outline">Latest v{prompt.latestVersion ?? 1}</Badge>
                  <span>Adoption: {prompt.metrics?.adoptionCount ?? 0}</span>
                  <span>Failures: {prompt.metrics?.recentFailures ?? 0}</span>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    Last reviewed: {prompt.lastReviewedAt ? new Date(prompt.lastReviewedAt).toLocaleDateString() : "n/a"}
                  </span>

                  <Link href={`/prompts/${prompt.id}`} passHref>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in PromptList:", error);
    return (
      <Alert className="mt-6" variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div>
              <strong>Unexpected Error:</strong> An error occurred while loading prompts.
            </div>
            <div className="text-sm font-mono bg-slate-100 p-2 rounded border">
              {error instanceof Error ? error.message : String(error)}
            </div>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
              <Link href="/prompts/new">
                <Button size="sm">
                  Create New Prompt
                </Button>
              </Link>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
}

function PromptListSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <PromptCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function PromptsPage({
  searchParams,
}: {
  searchParams?: Record<string, string>
}) {
  const filters: PromptFilters = {
    status: (searchParams?.status as PromptStatus | undefined) || undefined,
    category: searchParams?.category,
    owner: searchParams?.owner,
  }

  return (
    <PageContainer>
      <PageHeader
        title="Legal Prompts"
        description="Manage and organize your AI prompts for legal workflows"
      />
      <Suspense fallback={<PromptListSkeleton />}>
        <PromptList filters={filters} />
      </Suspense>
    </PageContainer>
  );
}

