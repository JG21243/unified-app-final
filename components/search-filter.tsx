"use client"

import React, { useState, FormEvent, ChangeEvent } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SearchFilterProps {
  categories: string[]
  onSearch: (term: string) => void
  onCategoryFilter: (categories: string[]) => void
}

export function SearchFilter({
  categories,
  onSearch,
  onCategoryFilter,
}: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])  

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev: string[]) => {
      const newSelection = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
      onCategoryFilter(newSelection)
      return newSelection
    })
  }

  const clearSearch = () => {
    setSearchTerm("")
    onSearch("")
  }

  const clearFilters = () => {
    setSelectedCategories([])
    onCategoryFilter([])
  }

  return (
    <div className="flex flex-col gap-4 mb-6">
      <form
        onSubmit={handleSearch}
        className="flex w-full flex-col sm:flex-row gap-2 sm:gap-0 sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search prompts..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            aria-label="Search prompts"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="w-full sm:w-auto">
            Search
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Filter by category"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category: string) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() =>
                    handleCategoryToggle(category)
                  }
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
              {selectedCategories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </form>

      {(searchTerm || selectedCategories.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <div className="flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded-md">
              <span>Search: {searchTerm}</span>
              <button
                onClick={clearSearch}
                aria-label="Remove search filter"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {selectedCategories.map((category: string) => (
            <div
              key={category}
              className="flex items-center gap-1 text-sm bg-muted px-2 py-1 rounded-md"
            >
              <span>{category}</span>
              <button
                onClick={() => handleCategoryToggle(category)}
                aria-label={`Remove category filter ${category}`}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {(searchTerm || selectedCategories.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearSearch()
                clearFilters()
              }}
              aria-label="Clear all filters"
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
