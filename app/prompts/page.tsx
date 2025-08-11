import { Suspense } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { getPrompts } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PromptsListSkeleton, EmptyPromptsState, PromptCardSkeleton } from "@/components/loading-states";
import { Alert, AlertDescription } from "@/components/ui/alert";

async function PromptList() {
  try {
    const { prompts, error } = await getPrompts();

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
      <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="group bg-card rounded-lg border p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200"
          >
            <div className="space-y-3">
              <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                {prompt.name}
              </h3>
              
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {prompt.prompt.startsWith("# ")
                  ? prompt.prompt.substring(2)
                  : prompt.prompt}
              </p>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                {prompt.category || 'Uncategorized'}
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
        ))}
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

export default async function PromptsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Legal Prompts"
        description="Manage and organize your AI prompts for legal workflows"
      />
      <Suspense fallback={<PromptListSkeleton />}>
        <PromptList />
      </Suspense>
    </PageContainer>
  );
}

