import { Suspense } from "react"
import Link from "next/link"
import { Plus, Inbox, AlertTriangle } from "lucide-react"

import { getPrompts } from "@/app/actions"
import { PromptCardSkeleton } from "@/components/prompt-card-skeleton"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"

export default async function Home() {
  return (
    <PageContainer>
      <Suspense fallback={<PromptListSkeleton />}>
        <PromptList />
      </Suspense>
    </PageContainer>
  )
}

async function PromptList() {
  try {
    const { prompts, error } = await getPrompts()

    if (error) {
      return (
        <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-700 flex-shrink-0" />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p>{error}</p>
          <p className="mt-4 text-sm">You may need to create the database table. Please run the following SQL:</p>
          <pre className="mt-2 p-2 sm:p-4 bg-gray-800 text-gray-100 rounded-md overflow-x-auto text-xs sm:text-sm">
            {`CREATE TABLE IF NOT EXISTS legalprompt (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  category VARCHAR(100),
  "systemMessage" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
          </pre>
        </div>
      )
    }

    if (!prompts || prompts.length === 0) {
      return (
        <div className="mt-4 sm:mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed p-6 sm:p-12 text-center bg-muted/20">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold">No prompts found</h2>
          <p className="mt-3 text-muted-foreground max-w-md px-4 text-sm sm:text-base">
            Get started by creating a new prompt for your legal AI workflows.
          </p>
          <Link href="/prompts/new">
            <Button className="mt-6 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Prompt
            </Button>
          </Link>
        </div>
      )
    }

    return (
      <div className="mt-4 sm:mt-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow">
            <h3 className="font-medium mb-2">{prompt.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{prompt.prompt.startsWith('# ') ? prompt.prompt.substring(2) : prompt.prompt}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{prompt.category}</span>
              <Link href={`/prompts/${prompt.id}`} passHref>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    )
  } catch (error) {
    console.error("Error in PromptList:", error)
    return (
      <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-700 flex-shrink-0" />
          <h2 className="text-xl font-semibold">Error</h2>
        </div>
        <p>An unexpected error occurred while loading prompts.</p>
        <p className="mt-2 text-sm font-mono">{error instanceof Error ? error.message : String(error)}</p>
      </div>
    )
  }
}

function PromptListSkeleton() {
  return (
    <div className="mt-4 sm:mt-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <PromptCardSkeleton key={i} />
      ))}
    </div>
  )
}

