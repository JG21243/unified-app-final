"use client"

import type React from "react"

import { useState } from "react"
import { X, Plus, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTags } from "@/components/tags-provider"
import { useToast } from "@/components/ui/use-toast"

export function TagsManager() {
  const { allTags, createTag, deleteTag } = useTags()
  const { toast } = useToast()
  const [newTag, setNewTag] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAddTag = () => {
    if (newTag.trim()) {
      if (allTags.includes(newTag.trim())) {
        toast({
          title: "Tag already exists",
          description: "This tag already exists in the system.",
          variant: "destructive",
        })
        return
      }

      createTag(newTag.trim())
      toast({
        title: "Tag created",
        description: `The tag "${newTag.trim()}" has been created.`,
      })
      setNewTag("")
      setIsAdding(false)
    }
  }

  const handleDeleteTag = (tag: string) => {
    deleteTag(tag)
    toast({
      title: "Tag deleted",
      description: `The tag "${tag}" has been deleted.`,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    } else if (e.key === "Escape") {
      setIsAdding(false)
      setNewTag("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Tag className="mr-2 h-5 w-5" />
          Manage Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-sm py-1 px-2">
                {tag}
                <button
                  onClick={() => handleDeleteTag(tag)}
                  className="ml-1 rounded-full hover:bg-muted"
                  aria-label={`Delete ${tag} tag`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {allTags.length === 0 && (
              <p className="text-sm text-muted-foreground">No tags created yet. Create your first tag below.</p>
            )}
          </div>

          {isAdding ? (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter tag name..."
                autoFocus
              />
              <Button onClick={handleAddTag}>Add</Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Tag
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

