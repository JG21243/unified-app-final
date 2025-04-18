"use client"

import { useState, useEffect, FormEvent, ChangeEvent } from "react"
import { Search, SlidersHorizontal, X, Calendar } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/Button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "./ui/dropdown-menu"
import { Badge } from "./ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar as CalendarComponent } from "./ui/calendar"
import { Combobox } from "./ui/combobox"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { format } from "date-fns"

interface AdvancedSearchProps {
  categories: string[]
  onSearch: (filters: SearchFilters) => void
  initialFilters?: {
    search?: string
    category?: string
  }
}

export interface SearchFilters {
  term: string
  categories: string[]
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  includeSystemMessages: boolean
  sortBy: string
}

export function AdvancedSearch({ categories, onSearch, initialFilters }: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialFilters?.search || "")
  const [selectedCategories, setSelectedCategories] = useState(
    (initialFilters?.category ? [initialFilters.category] : []) as string[],
  )
  const [dateRange, setDateRange] = useState(
    { from: undefined, to: undefined } as { from: Date | undefined; to: Date | undefined },
  )
  const [includeSystemMessages, setIncludeSystemMessages] = useState(true)
  const [sortBy, setSortBy] = useState("createdAt-desc")
  const [activeFilters, setActiveFilters] = useState([] as string[])
  const [selectedCategory, setSelectedCategory] = useState("")

  // Update active filters
  useEffect(() => {
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

