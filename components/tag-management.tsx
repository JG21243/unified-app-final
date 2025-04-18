"use client"

import { useState, useRef, useEffect } from "react"
import { X, Plus, TagIcon, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createTag, getAllTags } from "@/app/actions"

interface TagManagementProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  className?: string
  disabled?: boolean
}

export function TagManagement({ selectedTags, onTagsChange, className, disabled = false }: TagManagementProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingTag, setIsCreatingTag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      setIsLoading(true)
      try {
        const tags = await getAllTags()
        setAvailableTags(tags)
      } catch (error) {
        console.error("Error loading tags:", error)
        toast({
          title: "Error",
          description: "Failed to load tags",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadTags()
  }, [toast])

  const handleSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag]
      onTagsChange(newTags)
    }
    setInputValue("")
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleRemove = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag)
    onTagsChange(newTags)
  }

  const handleCreateTag = async () => {
    if (!inputValue.trim()) return

    setIsCreatingTag(true)
    try {
      const newTag = inputValue.trim()
      const result = await createTag(newTag)

      if (result.success) {
        setAvailableTags((prev) => [...prev, newTag])
        handleSelect(newTag)
        toast({
          title: "Tag created",
          description: `Tag "${newTag}" has been created.`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create tag",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating tag:", error)
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTag(false)
      setInputValue("")
    }
  }

  const filteredTags = availableTags.filter(
    (tag) => tag.toLowerCase().includes(inputValue.toLowerCase()) && !selectedTags.includes(tag),
  )

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 min-h-9">
        {selectedTags.map((tag) => (
          <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1 text-xs">
            <TagIcon className="h-3 w-3" />
            <span className="max-w-[100px] sm:max-w-[200px] truncate">{tag}</span>
            <button
              aria-label={`Remove tag ${tag}`}
              className="ml-1 text-muted-foreground hover:text-foreground rounded-full"
              onClick={() => handleRemove(tag)}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {!disabled && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 border-dashed" disabled={disabled}>
                <Plus className="h-3.5 w-3.5" />
                Add Tag
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[200px]" align="start">
              <Command>
                <CommandInput
                  placeholder="Search tags..."
                  value={inputValue}
                  onValueChange={setInputValue}
                  ref={inputRef}
                  className="h-9"
                />

                <CommandList>
                  {isLoading ? (
                    <div className="py-6 text-center">
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">Loading tags...</p>
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>
                        {inputValue.trim() !== "" ? (
                          <div className="py-3 px-2">
                            <p className="text-sm text-muted-foreground mb-2">Create new tag:</p>
                            <Button
                              size="sm"
                              className="w-full justify-start gap-1 h-8"
                              onClick={handleCreateTag}
                              disabled={isCreatingTag}
                            >
                              {isCreatingTag ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Plus className="h-3.5 w-3.5" />
                              )}
                              {`"${inputValue}"`}
                            </Button>
                          </div>
                        ) : (
                          <p className="py-6 text-center text-sm">No tags found.</p>
                        )}
                      </CommandEmpty>

                      {filteredTags.length > 0 && (
                        <CommandGroup heading="Available Tags">
                          {filteredTags.map((tag) => (
                            <CommandItem key={tag} value={tag} onSelect={() => handleSelect(tag)} className="gap-2">
                              <TagIcon className="h-3.5 w-3.5" />
                              {tag}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}

                      {inputValue.trim() !== "" && filteredTags.length > 0 && (
                        <>
                          <CommandSeparator />
                          <CommandGroup>
                            <CommandItem onSelect={handleCreateTag} className="gap-1">
                              <Plus className="h-3.5 w-3.5" />
                              {`Create "${inputValue}"`}
                            </CommandItem>
                          </CommandGroup>
                        </>
                      )}
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
}

