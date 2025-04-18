import { notFound } from "next/navigation"
import { PromptTesterStreaming } from "@/components/prompt-tester-streaming"
import { getLegalPromptById, getPromptTags } from "@/app/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { BarChart2, Pencil } from "lucide-react"
import Link from "next/link"
import { PromptActions } from "@/components/prompt-actions"
import { PageContainer } from "@/components/layout/page-container"
import { Badge } from "@/components/ui/badge"

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
      <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">{prompt.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Badge variant="secondary" className="px-2 py-1">
              {prompt.category}
            </Badge>
            <p className="text-xs sm:text-sm text-muted-foreground">Created {formatDate(prompt.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/prompts/${promptId}/edit`}>
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/prompts/${promptId}/analytics`}>
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Link>
          </Button>
          <PromptActions promptId={promptId} promptName={prompt.name} />
        </div>
      </div>

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

