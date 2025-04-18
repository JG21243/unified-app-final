"use client"

import type React from "react"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTags } from "@/components/tags-provider"

interface TagsInputProps {
  promptId: number
  className?: string
}

export function TagsInput({ promptId, className }: TagsInputProps) {
  const { getPromptTags, addTag, removeTag, allTags } = useTags()
  const [newTag, setNewTag] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const promptTags = getPromptTags(promptId)

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(promptId, newTag.trim())
      setNewTag("")
      setIsAdding(false)
    }
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
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {promptTags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
          <button
            onClick={() => removeTag(promptId, tag)}
            className="ml-1 rounded-full hover:bg-muted"
            aria-label={`Remove ${tag} tag`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {isAdding ? (
        <div className="flex items-center gap-1">
          <Input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 w-32 text-xs"
            placeholder="Add tag..."
            autoFocus
          />
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleAddTag}>
            <Plus className="h-3 w-3" />
            <span className="sr-only">Add Tag</span>
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => setIsAdding(true)}>
          <Plus className="mr-1 h-3 w-3" />
          Add Tag
        </Button>
      )}
    </div>
  )
}

