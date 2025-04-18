"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type TagsContextType = {
  promptTags: Record<number, string[]>
  allTags: string[]
  addTag: (promptId: number, tag: string) => void
  removeTag: (promptId: number, tag: string) => void
  createTag: (tag: string) => void
  deleteTag: (tag: string) => void
  getPromptTags: (promptId: number) => string[]
  isTagged: (promptId: number, tag: string) => boolean
}

const TagsContext = createContext<TagsContextType | undefined>(undefined)

export function TagsProvider({ children }: { children: React.ReactNode }) {
  const [promptTags, setPromptTags] = useState<Record<number, string[]>>({})
  const [allTags, setAllTags] = useState<string[]>([
    "contract",
    "legal-analysis",
    "client-advice",
    "research",
    "litigation",
    "corporate",
  ])

  // Load tags from localStorage on mount
  useEffect(() => {
    const storedPromptTags = localStorage.getItem("promptTags")
    const storedAllTags = localStorage.getItem("allTags")

    if (storedPromptTags) {
      try {
        setPromptTags(JSON.parse(storedPromptTags))
      } catch (error) {
        console.error("Failed to parse stored prompt tags:", error)
      }
    }

    if (storedAllTags) {
      try {
        setAllTags(JSON.parse(storedAllTags))
      } catch (error) {
        console.error("Failed to parse stored all tags:", error)
      }
    }
  }, [])

  // Save tags to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("promptTags", JSON.stringify(promptTags))
  }, [promptTags])

  useEffect(() => {
    localStorage.setItem("allTags", JSON.stringify(allTags))
  }, [allTags])

  // Add a tag to a prompt
  const addTag = (promptId: number, tag: string) => {
    setPromptTags((prev) => {
      const currentTags = prev[promptId] || []
      if (currentTags.includes(tag)) return prev

      const newTags = [...currentTags, tag]
      return { ...prev, [promptId]: newTags }
    })

    // Add to allTags if it doesn't exist
    if (!allTags.includes(tag)) {
      setAllTags((prev) => [...prev, tag])
    }
  }

  // Remove a tag from a prompt
  const removeTag = (promptId: number, tag: string) => {
    setPromptTags((prev) => {
      const currentTags = prev[promptId] || []
      const newTags = currentTags.filter((t) => t !== tag)
      const newPromptTags = { ...prev }

      if (newTags.length === 0) {
        delete newPromptTags[promptId]
      } else {
        newPromptTags[promptId] = newTags
      }

      return newPromptTags
    })
  }

  // Create a new tag
  const createTag = (tag: string) => {
    if (!allTags.includes(tag)) {
      setAllTags((prev) => [...prev, tag])
    }
  }

  // Delete a tag
  const deleteTag = (tag: string) => {
    setAllTags((prev) => prev.filter((t) => t !== tag))

    // Remove this tag from all prompts
    setPromptTags((prev) => {
      const newPromptTags = { ...prev }

      Object.keys(newPromptTags).forEach((promptIdStr) => {
        const promptId = Number.parseInt(promptIdStr)
        const currentTags = newPromptTags[promptId] || []
        const newTags = currentTags.filter((t) => t !== tag)

        if (newTags.length === 0) {
          delete newPromptTags[promptId]
        } else {
          newPromptTags[promptId] = newTags
        }
      })

      return newPromptTags
    })
  }

  // Get tags for a prompt
  const getPromptTags = (promptId: number): string[] => {
    return promptTags[promptId] || []
  }

  // Check if a prompt has a specific tag
  const isTagged = (promptId: number, tag: string): boolean => {
    const tags = promptTags[promptId] || []
    return tags.includes(tag)
  }

  return (
    <TagsContext.Provider
      value={{
        promptTags,
        allTags,
        addTag,
        removeTag,
        createTag,
        deleteTag,
        getPromptTags,
        isTagged,
      }}
    >
      {children}
    </TagsContext.Provider>
  )
}

export function useTags() {
  const context = useContext(TagsContext)
  if (context === undefined) {
    throw new Error("useTags must be used within a TagsProvider")
  }
  return context
}

