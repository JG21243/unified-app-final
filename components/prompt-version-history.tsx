"use client"

import { cn } from "@/lib/utils"

import { useState, useEffect } from "react"
import { formatDistanceToNow, format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { History, ArrowLeft, ArrowRight, RotateCcw, Clock, Eye, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { getPromptVersions, restorePromptVersion } from "@/app/actions"
import { Skeleton } from "@/components/ui/skeleton"
import { diffWords } from "diff"

interface PromptVersion {
  id: number
  promptId: number
  version: number
  name: string
  prompt: string
  category: string
  systemMessage: string | null
  tags: string[]
  createdAt: string
  createdBy: {
    name: string
    avatar: string
  }
  changeDescription: string
}

interface PromptVersionHistoryProps {
  promptId: number
  currentVersion?: number
  onVersionRestored?: () => void
}

export function PromptVersionHistory({ promptId, currentVersion = 1, onVersionRestored }: PromptVersionHistoryProps) {
  const [versions, setVersions] = useState<PromptVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null)
  const [comparisonVersion, setComparisonVersion] = useState<PromptVersion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRestoring, setIsRestoring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadVersions = async () => {
      setIsLoading(true)
      try {
        const result = await getPromptVersions(promptId)
        if (result.success) {
          setVersions(result.versions)
          if (result.versions.length > 0) {
            setSelectedVersion(result.versions[0])
            if (result.versions.length > 1) {
              setComparisonVersion(result.versions[1])
            }
          }
        } else {
          setError(result.error || "Failed to load version history")
        }
      } catch (error) {
        console.error("Error loading versions:", error)
        setError("Failed to load version history")
      } finally {
        setIsLoading(false)
      }
    }

    loadVersions()
  }, [promptId])

  const handleRestore = async () => {
    if (!selectedVersion) return

    setIsRestoring(true)
    try {
      const result = await restorePromptVersion(promptId, selectedVersion.id)

      if (result.success) {
        toast({
          title: "Version restored",
          description: `Restored to version ${selectedVersion.version}`,
        })
        onVersionRestored?.()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to restore version",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error restoring version:", error)
      toast({
        title: "Error",
        description: "Failed to restore version",
        variant: "destructive",
      })
    } finally {
      setIsRestoring(false)
    }
  }

  const handleNavigate = (direction: "prev" | "next") => {
    if (!selectedVersion) return

    const currentIndex = versions.findIndex((v) => v.id === selectedVersion.id)

    if (direction === "prev" && currentIndex < versions.length - 1) {
      setSelectedVersion(versions[currentIndex + 1])
    } else if (direction === "next" && currentIndex > 0) {
      setSelectedVersion(versions[currentIndex - 1])
    }
  }

  const renderDiff = (oldText: string, newText: string) => {
    const differences = diffWords(oldText, newText)

    return (
      <div className="whitespace-pre-wrap">
        {differences.map((part, index) => (
          <span
            key={index}
            className={cn(
              part.added && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
              part.removed && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
            )}
          >
            {part.value}
          </span>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>Error loading version history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </CardFooter>
      </Card>
    )
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>No previous versions found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This prompt has no version history yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Version History
        </CardTitle>
        <CardDescription>View and restore previous versions of this prompt</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {selectedVersion && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  v{selectedVersion.version}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDistanceToNow(new Date(selectedVersion.createdAt), { addSuffix: true })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNavigate("prev")}
                  disabled={versions.findIndex((v) => v.id === selectedVersion.id) === versions.length - 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNavigate("next")}
                  disabled={versions.findIndex((v) => v.id === selectedVersion.id) === 0}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Avatar>
                <AvatarImage src={selectedVersion.createdBy.avatar} alt={selectedVersion.createdBy.name} />
                <AvatarFallback>
                  {selectedVersion.createdBy.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{selectedVersion.createdBy.name}</div>
                <div className="text-xs text-muted-foreground">{selectedVersion.changeDescription}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(selectedVersion.createdAt), "PPpp")}
                </div>
              </div>
            </div>

            <Tabs defaultValue="content">
              <TabsList className="mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="diff" disabled={!comparisonVersion}>
                  Diff
                </TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Prompt</h4>
                  <div className="bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{selectedVersion.prompt}</div>
                </div>

                {selectedVersion.systemMessage && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">System Message</h4>
                    <div className="bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
                      {selectedVersion.systemMessage}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="diff" className="space-y-4">
                {comparisonVersion ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-semibold">
                        Comparing v{selectedVersion.version} with v{comparisonVersion.version}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <span className="inline-block w-3 h-3 bg-green-100 dark:bg-green-900/30"></span>
                          Added
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <span className="inline-block w-3 h-3 bg-red-100 dark:bg-red-900/30"></span>
                          Removed
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Prompt Changes</h4>
                      <div className="bg-muted/50 p-3 rounded-md">
                        {renderDiff(comparisonVersion.prompt, selectedVersion.prompt)}
                      </div>
                    </div>

                    {(selectedVersion.systemMessage || comparisonVersion.systemMessage) && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">System Message Changes</h4>
                        <div className="bg-muted/50 p-3 rounded-md">
                          {renderDiff(comparisonVersion.systemMessage || "", selectedVersion.systemMessage || "")}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No previous version available for comparison.</p>
                )}
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Name</h4>
                    <div className="bg-muted/50 p-3 rounded-md">{selectedVersion.name}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Category</h4>
                    <div className="bg-muted/50 p-3 rounded-md">{selectedVersion.category}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Tags</h4>
                  <div className="bg-muted/50 p-3 rounded-md">
                    {selectedVersion.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedVersion.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No tags</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => window.open(`/prompts/${promptId}/versions`, "_blank")}
        >
          <Eye className="h-4 w-4" />
          View All Versions
        </Button>

        <Button
          onClick={handleRestore}
          disabled={
            isRestoring ||
            selectedVersion?.version === currentVersion ||
            versions.findIndex((v) => v.id === selectedVersion?.id) === 0
          }
          className="gap-2"
        >
          {isRestoring ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Restoring...
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4" />
              Restore This Version
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

