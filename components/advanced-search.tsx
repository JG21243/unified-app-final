"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X, Tag, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  categories?: string[]
  tags?: string[]
  isLoading?: boolean
  initialFilters?: Partial<SearchFilters>
}

export interface SearchFilters {
  term: string
  category: string | null
  tags: string[]
  sortBy: 'name' | 'created' | 'updated' | 'category'
  sortOrder: 'asc' | 'desc'
  includeSystemMessages: boolean
}

export function AdvancedSearch({ 
  onSearch, 
  categories = [], 
  tags = [], 
  isLoading = false,
  initialFilters = {}
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    term: "",
    category: null,
    tags: [],
    sortBy: 'updated',
    sortOrder: 'desc',
    includeSystemMessages: true,
    ...initialFilters
  })
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Trigger search when filters change
  useEffect(() => {
    if (hasSearched) {
      onSearch(filters)
    }
  }, [filters, onSearch, hasSearched])

  const handleSearch = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setHasSearched(true)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      term: "",
      category: null,
      tags: [],
      sortBy: 'updated',
      sortOrder: 'desc',
      includeSystemMessages: true
    }
    setFilters(clearedFilters)
    setHasSearched(true)
  }

  const hasActiveFilters = filters.term || filters.category || filters.tags.length > 0

  return (
    <Card className="border-0 bg-muted/20">
      <CardContent className="p-4 space-y-4">
        {/* Main search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts by name, content, or category..."
              value={filters.term}
              onChange={(e) => handleSearch({ term: e.target.value })}
              className="pl-10 h-11 bg-background"
              disabled={isLoading}
            />
            {filters.term && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => handleSearch({ term: "" })}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
            <PopoverTrigger asChild>
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                size="sm"
                className="h-11 px-3 gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Advanced
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {(filters.category ? 1 : 0) + filters.tags.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Advanced Filters</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Category filter */}
                {categories.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={filters.category || "all"}
                      onValueChange={(value) => 
                        handleSearch({ category: value === "all" ? null : value })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Tags filter */}
                {tags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2 bg-background">
                      {tags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={filters.tags.includes(tag)}
                            onCheckedChange={(checked) => {
                              const newTags = checked
                                ? [...filters.tags, tag]
                                : filters.tags.filter(t => t !== tag)
                              handleSearch({ tags: newTags })
                            }}
                          />
                          <label 
                            htmlFor={`tag-${tag}`} 
                            className="text-sm cursor-pointer flex-1"
                          >
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sort options */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort by</label>
                  <div className="flex gap-2">
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: SearchFilters['sortBy']) => 
                        handleSearch({ sortBy: value })
                      }
                    >
                      <SelectTrigger className="flex-1 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="created">Date Created</SelectItem>
                        <SelectItem value="updated">Last Updated</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value: SearchFilters['sortOrder']) => 
                        handleSearch({ sortOrder: value })
                      }
                    >
                      <SelectTrigger className="w-24 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">↑ A-Z</SelectItem>
                        <SelectItem value="desc">↓ Z-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Include system messages */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-system"
                    checked={filters.includeSystemMessages}
                    onCheckedChange={(checked) => 
                      handleSearch({ includeSystemMessages: !!checked })
                    }
                  />
                  <label htmlFor="include-system" className="text-sm">
                    Include system messages
                  </label>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {filters.term && (
              <Badge variant="secondary" className="gap-1">
                <Search className="h-3 w-3" />
                "{filters.term}"
                <button
                  onClick={() => handleSearch({ term: "" })}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" />
                {filters.category}
                <button
                  onClick={() => handleSearch({ category: null })}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                <Tag className="h-3 w-3" />
                {tag}
                <button
                  onClick={() => 
                    handleSearch({ tags: filters.tags.filter(t => t !== tag) })
                  }
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Search results summary */}
        {hasSearched && (
          <div className="text-sm text-muted-foreground">
            Searching with {filters.sortBy} sorting ({filters.sortOrder === 'desc' ? 'newest' : 'oldest'} first)
          </div>
        )}
      </CardContent>
    </Card>
  )
}
    const filters: string[] = []

    if (selectedCategories.length > 0) {
      filters.push("categories")
    }

    if (dateRange.from || dateRange.to) {
      filters.push("date")
    }

    if (!includeSystemMessages) {
      filters.push("systemMessages")
    }

    if (sortBy !== "createdAt-desc") {
      filters.push("sort")
    }

    setActiveFilters(filters)
  }, [selectedCategories, dateRange, includeSystemMessages, sortBy])

  // Handle category selection
  useEffect(() => {
    if (selectedCategory && !selectedCategories.includes(selectedCategory)) {
      setSelectedCategories((prev: string[]) => [...prev, selectedCategory])
      setSelectedCategory("")
    }
  }, [selectedCategory, selectedCategories])

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSearch({
      term: searchTerm,
      categories: selectedCategories,
      dateRange,
      includeSystemMessages,
      sortBy,
    })
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev: string[]) => {
      const newSelection = prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
      return newSelection
    })
  }

  const clearSearch = () => {
    setSearchTerm("")
    onSearch({
      term: "",
      categories: selectedCategories,
      dateRange,
      includeSystemMessages,
      sortBy,
    })
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setDateRange({ from: undefined, to: undefined })
    setIncludeSystemMessages(true)
    setSortBy("createdAt-desc")
    onSearch({
      term: searchTerm,
      categories: [],
      dateRange: { from: undefined, to: undefined },
      includeSystemMessages: true,
      sortBy: "createdAt-desc",
    })
  }

  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined })
    onSearch({
      term: searchTerm,
      categories: selectedCategories,
      dateRange: { from: undefined, to: undefined },
      includeSystemMessages,
      sortBy,
    })
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    onSearch({
      term: searchTerm,
      categories: selectedCategories,
      dateRange,
      includeSystemMessages,
      sortBy: value,
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search prompts..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex-grow sm:flex-grow-0">
            Search
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className={activeFilters.length > 0 ? "relative" : ""}>
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilters.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="p-2">
                <Label className="text-xs font-normal text-muted-foreground mb-2">Categories</Label>
                <Combobox
                  options={categories.map((category) => ({ value: category, label: category }))}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Select category"
                  emptyMessage="No categories found"
                  className="w-full"
                />

                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedCategories.map((category: string) => (
                      <Badge key={category} variant="secondary" className="flex items-center gap-1">
                        {category}
                        <button
                          onClick={() => handleCategoryToggle(category)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          aria-label={`Remove category ${category}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <DropdownMenuSeparator />

              <div className="p-2">
                <Label className="text-xs font-normal text-muted-foreground mb-2">Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Select date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        const from = range?.from
                        const to = range?.to
                        setDateRange({ from, to })
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <DropdownMenuSeparator />

              <div className="p-2">
                <Label className="text-xs font-normal text-muted-foreground mb-2">Sort By</Label>
                <select
                  aria-label="Sort by"
                  className="w-full p-2 rounded-md border border-input bg-background text-sm"
                  value={sortBy}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => handleSortChange(e.target.value)}
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="category-asc">Category (A-Z)</option>
                </select>
              </div>

              <DropdownMenuSeparator />

              <div className="p-2 flex items-center justify-between">
                <Label className="text-xs font-normal text-muted-foreground" htmlFor="include-system">
                  Include system messages
                </Label>
                <Switch
                  id="include-system"
                  checked={includeSystemMessages}
                  onCheckedChange={setIncludeSystemMessages}
                />
              </div>

              {(selectedCategories.length > 0 ||
                dateRange.from ||
                dateRange.to ||
                !includeSystemMessages ||
                sortBy !== "createdAt-desc") && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </form>

      {(searchTerm ||
        selectedCategories.length > 0 ||
        dateRange.from ||
        dateRange.to ||
        !includeSystemMessages ||
        sortBy !== "createdAt-desc") && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>Search: {searchTerm}</span>
              <button
                onClick={clearSearch}
                className="text-muted-foreground hover:text-foreground ml-1"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedCategories.map((category: string) => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              <span>{category}</span>
              <button
                onClick={() => handleCategoryToggle(category)}
                className="text-muted-foreground hover:text-foreground ml-1"
                aria-label={`Remove category ${category}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {(dateRange.from || dateRange.to) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>
                Date: {dateRange.from ? format(dateRange.from, "MMM d") : "Any"}
                {" - "}
                {dateRange.to ? format(dateRange.to, "MMM d") : "Any"}
              </span>
              <button
                onClick={clearDateRange}
                className="text-muted-foreground hover:text-foreground ml-1"
                aria-label="Clear date range"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {!includeSystemMessages && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>Exclude system messages</span>
              <button
                onClick={() => setIncludeSystemMessages(true)}
                className="text-muted-foreground hover:text-foreground ml-1"
                aria-label="Include system messages"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {sortBy !== "createdAt-desc" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>
                Sort:{" "}
                {sortBy === "createdAt-asc"
                  ? "Oldest First"
                  : sortBy === "name-asc"
                    ? "Name (A-Z)"
                    : sortBy === "name-desc"
                      ? "Name (Z-A)"
                      : sortBy === "category-asc"
                        ? "Category (A-Z)"
                        : "Custom"}
              </span>
              <button
                onClick={() => handleSortChange("createdAt-desc")}
                className="text-muted-foreground hover:text-foreground ml-1"
                aria-label="Reset sort"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-7">
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}

