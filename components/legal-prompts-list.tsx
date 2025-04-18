"use client"

import { cn } from "@/lib/utils"

import { useState, useTransition, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { LegalPrompt } from "@/app/actions"
import { getLegalPrompts, duplicateLegalPrompt, deleteLegalPrompt } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AdvancedSearch, type SearchFilters } from "./advanced-search"
import { BulkActions } from "./bulk-actions"
import {
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Check,
  Loader2,
  LayoutGrid,
  List,
  Star,
  StarOff,
  Keyboard,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PromptCard } from "./prompt-card"
import { PromptListItem } from "./prompt-list-item"
import { Section } from "./layout/section"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PromptListSkeleton } from "./prompt-list-skeleton"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Import the useFavorites hook
import { useFavorites } from "@/components/favorites-provider"

interface LegalPromptsListProps {
  initialPrompts: LegalPrompt[]
  initialCategories: string[]
  initialTotal: number
  initialFilters?: {
    category?: string
    search?: string
  }
}

type SortOption = "createdAt-desc" | "createdAt-asc" | "name-asc" | "name-desc" | "category-asc" | "favorites"
type ViewMode = "grid" | "list"

export function LegalPromptsList({
  initialPrompts,
  initialCategories,
  initialTotal,
  initialFilters,
}: LegalPromptsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [prompts, setPrompts] = useState<LegalPrompt[]>(initialPrompts)
  const [total, setTotal] = useState<number>(initialTotal)
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPrompts, setSelectedPrompts] = useState<number[]>([])
  const [sortOption, setSortOption] = useState<SortOption>("createdAt-desc")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [promptToDelete, setPromptToDelete] = useState<number | null>(null)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const promptsPerPage = viewMode === "grid" ? 6 : 10

  // Add the useFavorites hook inside the component
  const { favorites } = useFavorites()

  // Calculate pagination
  const totalPages = Math.ceil(total / promptsPerPage)

  // Apply search filters
  const handleSearch = (filters: SearchFilters) => {
    setIsLoading(true)
    setError(null)

    startTransition(async () => {
      try {
        // Map the sort option to the format expected by the API
        let sortBy: string
        switch (filters.sortBy) {
          case "createdAt-asc":
            sortBy = '"createdAt" ASC'
            break
          case "name-asc":
            sortBy = "name ASC"
            break
          case "name-desc":
            sortBy = "name DESC"
            break
          case "category-asc":
            sortBy = "category ASC"
            break
          case "favorites":
            sortBy = '"createdAt" DESC' // Default sort for favorites
            break
          default:
            sortBy = '"createdAt" DESC'
        }

        // Fetch data from the server
        const result = await getLegalPrompts({
          search: filters.term,
          category: filters.categories,
          dateRange: {
            from: filters.dateRange.from?.toISOString(),
            to: filters.dateRange.to?.toISOString(),
          },
          includeSystemMessages: filters.includeSystemMessages,
          sortBy,
          limit: promptsPerPage,
          offset: 0, // Reset to first page
        })

        let filteredPrompts = result.prompts
        let filteredTotal = result.total

        // If showing favorites only, filter the results client-side
        if (showFavoritesOnly) {
          filteredPrompts = filteredPrompts.filter((prompt) => favorites.includes(prompt.id))
          filteredTotal = filteredPrompts.length
        }

        // If sorting by favorites, bring favorites to the top
        if (filters.sortBy === "favorites") {
          filteredPrompts.sort((a, b) => {
            const aIsFavorite = favorites.includes(a.id) ? 1 : 0
            const bIsFavorite = favorites.includes(b.id) ? 1 : 0
            return bIsFavorite - aIsFavorite || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })
        }

        setPrompts(filteredPrompts)
        setTotal(filteredTotal)
        setCurrentPage(1) // Reset to first page when filters change

        // Update URL with search params
        const params = new URLSearchParams()
        if (filters.term) params.set("search", filters.term)
        if (filters.categories.length === 1) params.set("category", filters.categories[0])
        if (filters.sortBy !== "createdAt-desc") params.set("sort", filters.sortBy)
        if (showFavoritesOnly) params.set("favorites", "true")

        // Update the URL without refreshing the page
        const newUrl = `/?${params.toString()}`
        router.push(newUrl, { scroll: false })
      } catch (err) {
        console.error("Error fetching prompts:", err)
        setError("Failed to fetch prompts. Please try again.")
      } finally {
        setIsLoading(false)
      }
    })
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page === currentPage) return

    setIsLoading(true)
    setError(null)

    startTransition(async () => {
      try {
        // Map the sort option to the format expected by the API
        let sortBy: string
        switch (sortOption) {
          case "createdAt-asc":
            sortBy = '"createdAt" ASC'
            break
          case "name-asc":
            sortBy = "name ASC"
            break
          case "name-desc":
            sortBy = "name DESC"
            break
          case "category-asc":
            sortBy = "category ASC"
            break
          case "favorites":
            sortBy = '"createdAt" DESC' // Default sort for favorites
            break
          default:
            sortBy = '"createdAt" DESC'
        }

        // Get current search params
        const term = searchParams.get("search") || ""
        const category = searchParams.get("category")

        // Fetch data for the new page
        const result = await getLegalPrompts({
          search: term,
          category: category ? [category] : undefined,
          sortBy,
          limit: promptsPerPage,
          offset: (page - 1) * promptsPerPage,
        })

        let filteredPrompts = result.prompts

        // If showing favorites only, filter the results client-side
        if (showFavoritesOnly) {
          filteredPrompts = filteredPrompts.filter((prompt) => favorites.includes(prompt.id))
        }

        // If sorting by favorites, bring favorites to the top
        if (sortOption === "favorites") {
          filteredPrompts.sort((a, b) => {
            const aIsFavorite = favorites.includes(a.id) ? 1 : 0
            const bIsFavorite = favorites.includes(b.id) ? 1 : 0
            return bIsFavorite - aIsFavorite || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })
        }

        setPrompts(filteredPrompts)
        setCurrentPage(page)
      } catch (err) {
        console.error("Error fetching prompts:", err)
        setError("Failed to fetch prompts. Please try again.")
      } finally {
        setIsLoading(false)
      }
    })
  }

  // Handle prompt selection
  const togglePromptSelection = (id: number) => {
    setSelectedPrompts((prev) => (prev.includes(id) ? prev.filter((promptId) => promptId !== id) : [...prev, id]))
  }

  const toggleAllPrompts = () => {
    if (selectedPrompts.length === prompts.length) {
      setSelectedPrompts([])
    } else {
      setSelectedPrompts(prompts.map((prompt) => prompt.id))
    }
  }

  const clearSelection = () => {
    setSelectedPrompts([])
  }

  // Handle favorites
  const handleFavoriteToggle = (id: number, isFavorite: boolean) => {
    // In a real app, this would call an API to update the favorite status
    // For now, we'll just update the local state
    setPrompts((prevPrompts) => prevPrompts.map((prompt) => (prompt.id === id ? { ...prompt, isFavorite } : prompt)))
  }

  // Update the toggleFavoritesFilter function to filter client-side when needed
  const toggleFavoritesFilter = () => {
    const newState = !showFavoritesOnly
    setShowFavoritesOnly(newState)

    // If we're showing favorites, filter the prompts client-side
    if (newState) {
      // Filter the current prompts to only show favorites
      const filteredPrompts = prompts.filter((prompt) => favorites.includes(prompt.id))
      setPrompts(filteredPrompts)
      setTotal(filteredPrompts.length)
    } else {
      // If turning off favorites filter, refresh the list with the original filters
      handleSearch({
        term: searchParams.get("search") || "",
        categories: searchParams.get("category") ? [searchParams.get("category")!] : [],
        dateRange: { from: undefined, to: undefined },
        includeSystemMessages: true,
        sortBy: sortOption,
      })
    }

    toast({
      title: newState ? "Showing favorites only" : "Showing all prompts",
      duration: 3000,
    })
  }

  // Handle duplicate
  const handleDuplicate = async (id: number) => {
    try {
      const result = await duplicateLegalPrompt(id)
      if (result.success) {
        // Refresh the list
        handleSearch({
          term: searchParams.get("search") || "",
          categories: searchParams.get("category") ? [searchParams.get("category")!] : [],
          dateRange: { from: undefined, to: undefined },
          includeSystemMessages: true,
          sortBy: sortOption,
        })
      }
    } catch (error) {
      console.error("Error duplicating prompt:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate prompt",
        variant: "destructive",
      })
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (promptToDelete === null) return

    try {
      const result = await deleteLegalPrompt(promptToDelete)
      if (result.success) {
        toast({
          title: "Prompt deleted",
          description: "The prompt has been successfully deleted.",
        })

        // Remove from local state
        setPrompts((prevPrompts) => prevPrompts.filter((prompt) => prompt.id !== promptToDelete))
        setTotal((prev) => prev - 1)

        // If we deleted the last prompt on the page, go to the previous page
        if (prompts.length === 1 && currentPage > 1) {
          handlePageChange(currentPage - 1)
        }
      }
    } catch (error) {
      console.error("Error deleting prompt:", error)
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive",
      })
    } finally {
      setPromptToDelete(null)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      switch (e.key) {
        case "g":
          setViewMode("grid")
          break
        case "l":
          setViewMode("list")
          break
        case "f":
          toggleFavoritesFilter()
          break
        case "?":
          setShowKeyboardShortcuts(true)
          break
        case "ArrowLeft":
          if (currentPage > 1) {
            handlePageChange(currentPage - 1)
          }
          break
        case "ArrowRight":
          if (currentPage < totalPages) {
            handlePageChange(currentPage + 1)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentPage, totalPages, showFavoritesOnly])

  // Calculate pagination

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (initialPrompts.length === 0 && total === 0) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium mb-2">No prompts found</h3>
        <p className="text-muted-foreground mb-4">Create your first prompt to get started.</p>
        <Button asChild>
          <a href="/?tab=create">Create a Prompt</a>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Section contentClassName="space-y-6">
        <AdvancedSearch categories={categories} onSearch={handleSearch} initialFilters={initialFilters} />

        <BulkActions selectedPrompts={selectedPrompts} categories={categories} onClearSelection={clearSelection} />

        {isLoading ? (
          <PromptListSkeleton viewMode={viewMode} />
        ) : prompts.length === 0 ? (
          <div className="text-center p-8 bg-muted/30 rounded-lg border border-border/50">
            <h3 className="text-lg font-medium mb-2">No matching prompts</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search filters.</p>
            <Button
              variant="outline"
              onClick={() =>
                handleSearch({
                  term: "",
                  categories: [],
                  dateRange: { from: undefined, to: undefined },
                  includeSystemMessages: true,
                  sortBy: "createdAt-desc",
                })
              }
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-center">
                <Checkbox
                  id="select-all"
                  checked={selectedPrompts.length === prompts.length && prompts.length > 0}
                  onCheckedChange={toggleAllPrompts}
                  className="mr-2"
                />
                <label htmlFor="select-all" className="text-sm">
                  Select all on this page
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-1",
                    showFavoritesOnly &&
                      "bg-amber-100/50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-500",
                  )}
                  onClick={toggleFavoritesFilter}
                >
                  {showFavoritesOnly ? (
                    <>
                      <StarOff className="h-4 w-4" />
                      <span className="hidden sm:inline">All Prompts</span>
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4" />
                      <span className="hidden sm:inline">Favorites</span>
                    </>
                  )}
                </Button>

                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("rounded-none px-2 h-8", viewMode === "grid" ? "bg-muted" : "hover:bg-transparent")}
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("rounded-none px-2 h-8", viewMode === "list" ? "bg-muted" : "hover:bg-transparent")}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowKeyboardShortcuts(true)}
                >
                  <Keyboard className="h-4 w-4" />
                  <span className="sr-only">Keyboard shortcuts</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ListFilter className="h-4 w-4" />
                      <span className="hidden sm:inline">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortOption("favorites")}>
                      {sortOption === "favorites" && <Check className="h-4 w-4 mr-2" />}
                      Favorites First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("createdAt-desc")}>
                      {sortOption === "createdAt-desc" && <Check className="h-4 w-4 mr-2" />}
                      Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("createdAt-asc")}>
                      {sortOption === "createdAt-asc" && <Check className="h-4 w-4 mr-2" />}
                      Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name-asc")}>
                      {sortOption === "name-asc" && <Check className="h-4 w-4 mr-2" />}
                      Name (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name-desc")}>
                      {sortOption === "name-desc" && <Check className="h-4 w-4 mr-2" />}
                      Name (Z-A)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("category-asc")}>
                      {sortOption === "category-asc" && <Check className="h-4 w-4 mr-2" />}
                      Category
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline ml-2">
                  {total} {total === 1 ? "prompt" : "prompts"}
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === "grid" ? (
                <motion.div
                  key={`grid-${sortOption}-${currentPage}-${showFavoritesOnly}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {prompts.map((prompt) => (
                    <motion.div
                      key={prompt.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover-lift"
                    >
                      <PromptCard
                        prompt={prompt}
                        isSelected={selectedPrompts.includes(prompt.id)}
                        onSelect={togglePromptSelection}
                        onFavorite={handleFavoriteToggle}
                        onDuplicate={handleDuplicate}
                        onDelete={(id) => setPromptToDelete(id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key={`list-${sortOption}-${currentPage}-${showFavoritesOnly}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-3"
                >
                  {prompts.map((prompt) => (
                    <motion.div
                      key={prompt.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover-lift"
                    >
                      <PromptListItem
                        prompt={prompt}
                        isSelected={selectedPrompts.includes(prompt.id)}
                        onSelect={togglePromptSelection}
                        onFavorite={handleFavoriteToggle}
                        onDuplicate={handleDuplicate}
                        onDelete={(id) => setPromptToDelete(id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isPending}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      // Calculate page numbers to show (centered around current page)
                      let pageNum = i + 1
                      if (totalPages > 5) {
                        if (currentPage > 3) {
                          pageNum = currentPage - 3 + i
                        }
                        if (currentPage > totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        }
                      }

                      return pageNum <= totalPages ? (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isPending}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      ) : null
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isPending}
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Section>

      {/* Delete confirmation dialog */}
      <AlertDialog open={promptToDelete !== null} onOpenChange={(open) => !open && setPromptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the prompt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keyboard shortcuts dialog */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Use these keyboard shortcuts to navigate and manage your prompts more efficiently.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold mr-2">g</kbd>
              <span>Grid view</span>
            </div>
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold mr-2">l</kbd>
              <span>List view</span>
            </div>
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold mr-2">f</kbd>
              <span>Toggle favorites</span>
            </div>
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold mr-2">?</kbd>
              <span>Show shortcuts</span>
            </div>
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold mr-2">←</kbd>
              <span>Previous page</span>
            </div>
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-muted rounded text-xs font-semibold mr-2">→</kbd>
              <span>Next page</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

