"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, StarOff, Copy, Trash, Edit, Clock, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFavorites } from "@/components/favorites-provider"
import { useTags } from "@/components/tags-provider"
import { TagsInput } from "@/components/tags-input"
import { type LegalPrompt, duplicateLegalPrompt, deleteLegalPrompt } from "@/app/actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { PromptVersionHistory } from "@/components/prompt-version-history"
import { PromptTestInterface } from "@/components/prompt-test-interface"
import { PromptAnalytics } from "@/components/prompt-analytics"

interface PromptDetailProps {
  prompt: LegalPrompt
}

export function PromptDetail({ prompt }: PromptDetailProps) {
  const { id, name, category, prompt: promptText, systemMessage, createdAt } = prompt
  const { toast } = useToast()
  const router = useRouter()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const { getPromptTags } = useTags()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)

  const promptTags = getPromptTags(id)
  const isFavorited = isFavorite(id)

  // Extract variables from the prompt
  const variables = promptText.match(/\{\{([^}]+)\}\}/g) || []
  const uniqueVariables = [...new Set(variables.map((v) => v.slice(2, -2)))]

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    try {
      const result = await duplicateLegalPrompt(id)
      if (result.success) {
        toast({
          title: "Prompt duplicated",
          description: "The prompt has been duplicated successfully.",
        })
        if (result.data) {
          router.push(`/prompts/${result.data.id}`)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to duplicate prompt.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsDuplicating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteLegalPrompt(id)
      if (result.success) {
        toast({
          title: "Prompt deleted",
          description: "The prompt has been deleted successfully.",
        })
        router.push("/")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete prompt.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{category}</Badge>
            <span className="text-sm text-muted-foreground">Created on {formatDate(createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(id)}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorited ? (
              <Star className="h-5 w-5 fill-primary text-primary" />
            ) : (
              <StarOff className="h-5 w-5" />
            )}
          </Button>
          <Button variant="outline" onClick={handleDuplicate} disabled={isDuplicating}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/prompts/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-3/4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">{promptText}</pre>
            </CardContent>
          </Card>

          {systemMessage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Message</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">{systemMessage}</pre>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="test">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="test">Test Prompt</TabsTrigger>
              <TabsTrigger value="versions">Version History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="test" className="mt-4">
              <PromptTestInterface prompt={prompt} />
            </TabsContent>
            <TabsContent value="versions" className="mt-4">
              <PromptVersionHistory promptId={id} />
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              <PromptAnalytics promptId={id} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-1/4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TagsInput promptId={id} />
            </CardContent>
          </Card>

          {uniqueVariables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Variables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {uniqueVariables.map((variable) => (
                    <Badge key={variable} variant="outline" className="mr-2">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p>Created: {formatDate(createdAt)}</p>
                <p className="mt-1">Last modified: {formatDate(createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

