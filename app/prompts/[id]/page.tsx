import { Suspense } from "react"
import Link from "next/link"
import { AlertTriangle, Pencil, MessageSquare } from "lucide-react"

import { getLegalPromptById, getPromptTags } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PromptActions } from "@/components/prompt-actions"
import { PromptTesterStreaming } from "@/components/prompt-tester-streaming"

interface PromptPageProps {
  params: {
    id: string
  }
}

// Combined skeleton for the entire page content
function PromptPageContentSkeleton() {
  return (
    <div className="mt-6"> {/* Added margin-top to match PageHeader's bottom margin */}
      {/* Skeleton for PageHeader */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 gap-4 mb-6 sm:mb-10">
        <div className="space-y-2">
          <Skeleton className="h-10 w-1/2" /> {/* Title */}
          <Skeleton className="h-4 w-1/3" /> {/* Description (category/tags) */}
        </div>
        <div className="flex flex-wrap items-center gap-3"> {/* Actions */}
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <PromptDetailSkeleton />
        <PromptTesterSkeleton />
      </div>
    </div>
  )
}

async function PromptDataView({ promptId }: { promptId: number }) {
  try {
    const prompt = await getLegalPromptById(promptId);

    if (!prompt) {
      return notFound();
    }

    const tags = await getPromptTags(promptId);
    const variables = prompt.variables || [];
    const versions = prompt.versions || []
    const metrics = prompt.metrics || { adoptionCount: 0, recentFailures: 0, lastUsedAt: null }

    return (
      <>
        <PageHeader
          title={prompt.name}
          description={
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge variant="outline" className="text-xs capitalize">
                {prompt.status || "draft"}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {prompt.category || "Uncategorized"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Owner: {prompt.owner || "unassigned"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                v{prompt.latestVersion ?? 1}
              </Badge>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          }
          actions={
            <div className="flex flex-wrap gap-3">
              <Link href={`/prompts/${promptId}/edit`} passHref>
                <Button variant="outline">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Link href={`/chat?promptId=${promptId}`} passHref>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Test in Chat
                </Button>
              </Link>
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

          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-muted/30 pb-3">
                <CardTitle>Quality metrics</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Adoption count</p>
                  <p className="text-lg font-semibold">{metrics.adoptionCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recent failures</p>
                  <p className="text-lg font-semibold">{metrics.recentFailures}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last reviewed</p>
                  <p className="text-sm font-medium">
                    {prompt.lastReviewedAt ? new Date(prompt.lastReviewedAt).toLocaleString() : "Pending"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last used</p>
                  <p className="text-sm font-medium">{metrics.lastUsedAt ? new Date(metrics.lastUsedAt).toLocaleString() : "n/a"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-muted/30 pb-3">
                <CardTitle>Version history</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {versions.length === 0 && <p className="text-sm text-muted-foreground">No versions recorded yet.</p>}
                {versions.map((version) => (
                  <div key={version.id} className="rounded-lg border p-3 space-y-1 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">v{version.versionNumber}</Badge>
                        <Badge variant={version.status === "published" ? "default" : "secondary"} className="capitalize">
                          {version.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {version.diffSummary && (
                      <p className="text-sm text-muted-foreground">{version.diffSummary}</p>
                    )}
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                      <span>Author: {version.createdBy}</span>
                      {version.reviewedBy && <span>Reviewed by: {version.reviewedBy}</span>}
                      {version.reviewedAt && <span>Reviewed at: {new Date(version.reviewedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <PromptTesterStreaming
              promptId={promptId}
              prompt={prompt.prompt}
              systemMessage={prompt.systemMessage}
              variables={variables}
            />
          </div>
        </div>
      </>
    )
  } catch (error: any) {
    console.error("Error fetching prompt data:", error)
    return (
      <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-700 flex-shrink-0" />
          <h2 className="text-xl font-semibold">Error Loading Prompt</h2>
        </div>
        <p>An unexpected error occurred while trying to load the prompt details.</p>
        <p className="mt-2 text-sm font-mono">{error.message || "Unknown error"}</p>
      </div>
    )
  }
}

export default async function PromptPage({ params }: PromptPageProps) {
  const promptIdNum = Number.parseInt(params.id)

  if (isNaN(promptIdNum)) {
    return notFound()
  }

  return (
    <PageContainer>
      <Suspense fallback={<PromptPageContentSkeleton />}>
        <PromptDataView promptId={promptIdNum} />
      </Suspense>
    </PageContainer>
  )
}

// Combined skeleton for prompt details and tester
function PromptDetailSkeleton() {
  return (
    <div className="space-y-8"> {/* Changed space-y-4 to space-y-8 to match content */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 pb-3">
          <Skeleton className="h-6 w-1/3" /> {/* CardTitle */}
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="h-20 w-full" /> {/* Prompt content */}
        </CardContent>
      </Card>
      <Card className="overflow-hidden"> {/* Skeleton for System Message (optional) */}
        <CardHeader className="bg-muted/30 pb-3">
          <Skeleton className="h-6 w-1/3" /> {/* CardTitle */}
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <Card className="overflow-hidden"> {/* Skeleton for Variables */}
        <CardHeader className="bg-muted/30 pb-3">
          <Skeleton className="h-6 w-1/3" /> {/* CardTitle */}
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PromptTesterSkeleton() {
  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card"> {/* Added common card styling */}
      <Skeleton className="h-8 w-1/2 mb-4" /> {/* Title for tester */}
      
      {/* Skeleton for variable inputs if any */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      <Skeleton className="h-10 w-full" /> {/* Test button */}
      
      <div className="mt-6 space-y-2">
        <Skeleton className="h-6 w-1/3" /> {/* Response header */}
        <Skeleton className="h-32 w-full rounded-md border p-4" /> {/* Response area */}
      </div>
    </div>
  )
}

