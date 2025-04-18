"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { type LegalPrompt, updateLegalPrompt, getPromptTags } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { TagManagement } from "@/components/tag-management"
import { Loader2 } from "lucide-react"

interface EditPromptFormProps {
  prompt: LegalPrompt
}

export function EditPromptForm({ prompt }: EditPromptFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTags, setIsLoadingTags] = useState(true)
  const [formData, setFormData] = useState({
    name: prompt.name,
    category: prompt.category,
    prompt: prompt.prompt,
    systemMessage: prompt.systemMessage || "",
  })
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    const loadTags = async () => {
      try {
        const promptTags = await getPromptTags(prompt.id)
        setTags(promptTags)
      } catch (error) {
        console.error("Error loading tags:", error)
        toast({
          title: "Error",
          description: "Failed to load tags",
          variant: "destructive",
        })
      } finally {
        setIsLoadingTags(false)
      }
    }

    loadTags()
  }, [prompt.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateLegalPrompt(prompt.id, {
        name: formData.name,
        category: formData.category,
        prompt: formData.prompt,
        systemMessage: formData.systemMessage || null,
        tags: tags,
      })

      toast({
        title: "Success",
        description: "Prompt updated successfully",
      })

      router.push(`/prompts/${prompt.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating prompt:", error)
      toast({
        title: "Error",
        description: "Failed to update prompt",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" value={formData.category} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            {isLoadingTags ? (
              <div className="flex items-center gap-2 h-9">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading tags...</span>
              </div>
            ) : (
              <TagManagement selectedTags={tags} onTagsChange={setTags} disabled={isSubmitting} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              name="prompt"
              value={formData.prompt}
              onChange={handleChange}
              required
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemMessage">System Message (Optional)</Label>
            <Textarea
              id="systemMessage"
              name="systemMessage"
              value={formData.systemMessage}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

