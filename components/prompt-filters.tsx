"use client"

import { useState, useEffect } from "react"
import { Tag, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTags } from "@/components/tags-provider"

interface PromptFilterFields {
  category?: string[]
  dateRange?: {
    from?: string
    to?: string
  }
}

interface PromptFiltersProps {
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
  selectedTags: string[]
  onTagChange: (tags: string[]) => void
  categories: string[]
  filters: PromptFilterFields
  onFilterChange: (filters: PromptFilterFields) => void
}

export function PromptFilters({
  selectedCategories,
  onCategoryChange,
  selectedTags,
  onTagChange,
  categories,
  filters,
  onFilterChange,
}: PromptFiltersProps) {
  const { allTags } = useTags()
  const [localSelectedCategories, setLocalSelectedCategories] = useState<string[]>(selectedCategories)
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>(selectedTags)
  const [selectedCategoriesState, setSelectedCategories] = useState<string[]>(selectedCategories)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  useEffect(() => {
    setLocalSelectedCategories(selectedCategories)
  }, [selectedCategories])

  useEffect(() => {
    setLocalSelectedTags(selectedTags)
  }, [selectedTags])

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategoriesState.includes(category)
      ? selectedCategoriesState.filter((c) => c !== category)
      : [...selectedCategoriesState, category]

    setSelectedCategories(newCategories)

    // Make sure we're passing the updated categories to the parent component
    onFilterChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories : undefined,
    })
  }

  const handleTagChange = (tag: string, checked: boolean) => {
    const updatedTags = checked ? [...localSelectedTags, tag] : localSelectedTags.filter((t) => t !== tag)

    setLocalSelectedTags(updatedTags)
    onTagChange(updatedTags)
  }

  const clearCategoryFilter = (category: string) => {
    const updatedCategories = localSelectedCategories.filter((c) => c !== category)
    setLocalSelectedCategories(updatedCategories)
    onCategoryChange(updatedCategories)
  }

  const clearTagFilter = (tag: string) => {
    const updatedTags = localSelectedTags.filter((t) => t !== tag)
    setLocalSelectedTags(updatedTags)
    onTagChange(updatedTags)
  }

  const clearAllFilters = () => {
    setLocalSelectedCategories([])
    setLocalSelectedTags([])
    onCategoryChange([])
    onTagChange([])
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)

    // Format dates as ISO strings for the database query
    const formattedRange = range
      ? {
          from: range.from ? range.from.toISOString() : undefined,
          to: range.to ? range.to.toISOString() : undefined,
        }
      : undefined

    // Make sure we're passing the updated date range to the parent component
    onFilterChange({
      ...filters,
      dateRange: formattedRange,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Categories
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={localSelectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Tag className="mr-2 h-4 w-4" />
              Tags
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <div className="space-y-2">
              {allTags.map((tag) => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={localSelectedTags.includes(tag)}
                    onCheckedChange={(checked) => handleTagChange(tag, checked === true)}
                  />
                  <label
                    htmlFor={`tag-${tag}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tag}
                  </label>
                </div>
              ))}
              {allTags.length === 0 && <p className="text-sm text-muted-foreground">No tags available</p>}
            </div>
          </PopoverContent>
        </Popover>

        {(localSelectedCategories.length > 0 || localSelectedTags.length > 0) && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        )}
      </div>

      {(localSelectedCategories.length > 0 || localSelectedTags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {localSelectedCategories.map((category) => (
            <Badge key={category} variant="secondary">
              {category}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => clearCategoryFilter(category)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {category} filter</span>
              </Button>
            </Badge>
          ))}

          {localSelectedTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              <Tag className="mr-1 h-3 w-3" />
              {tag}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => clearTagFilter(tag)}>
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {tag} filter</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

interface DateRange {
  from?: Date
  to?: Date
}

