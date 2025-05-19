import { Suspense } from "react"
import Link from "next/link"
import { Plus, Inbox, AlertTriangle, Pencil, MessageSquare } from "lucide-react" // Added Pencil and MessageSquare

import { getPrompts, getLegalPromptById, getPromptTags } from "@/app/actions" // Added getLegalPromptById and getPromptTags
import { PromptCardSkeleton } from "@/components/prompt-card-skeleton"
import { Button } from "@/components/ui/button"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { notFound } from "next/navigation" // Added notFound
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" // Added Card components
import { Skeleton } from "@/components/ui/skeleton" // Added Skeleton
import { PromptActions } from "@/components/prompt-actions" // Added PromptActions
import { PromptTesterStreaming } from "@/components/prompt-tester-streaming" // Added PromptTesterStreaming

interface PromptPageProps {
  params: {
    id: string
  }
}

export default async function PromptPage({ params }: PromptPageProps) {
  const promptId = Number.parseInt(params.id)

  if (isNaN(promptId)) {
    return notFound()
  }

  const prompt = await getLegalPromptById(promptId)

  if (!prompt) {
    return notFound()
  }

  // Get tags for this prompt
  const tags = await getPromptTags(promptId)

  // Extract variables from the prompt
  const variables = prompt.variables || []

  return (
    <PageContainer>
      <PageHeader
        title={prompt.name}
        description={
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {prompt.category || "Uncategorized"}
            </span>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span key={tag.id} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href={`/prompts/${promptId}/edit`} className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/chat" className="gap-2"> {/* Assuming a general chat page, adjust if needed */}
                <MessageSquare className="h-4 w-4" />
                Test in Chat
              </Link>
            </Button>
            <PromptActions promptId={promptId} promptName={prompt.name} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-8">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle>Prompt</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 font-mono text-sm border border-border/40">
                {prompt.prompt}
              </div>
            </CardContent>
          </Card>

          {prompt.systemMessage && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <CardTitle>System Message</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 font-mono text-sm border border-border/40">
                  {prompt.systemMessage}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle>Variables</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {variables.length > 0 ? (
                <ul className="grid grid-cols-2 gap-2">
                  {variables.map((variable) => (
                    <li key={variable} className="font-mono text-sm bg-muted/50 p-2 rounded-md border border-border/40">
                      {variable}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No variables found in this prompt.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <PromptTesterStreaming
            promptId={promptId}
            prompt={prompt.prompt}
            systemMessage={prompt.systemMessage}
            variables={variables}
          />
        </div>
      </div>
    </PageContainer>
  )
}

function PromptDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

function PromptTesterSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

