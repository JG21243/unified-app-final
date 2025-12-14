"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Activity, AlertTriangle, Filter, Search, Star, Timer } from "lucide-react"

import type { LegalPrompt } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PromptListClientProps {
  prompts: LegalPrompt[]
  error?: string | null
}

type SortOption = "recent" | "name" | "usage" | "favorite"

export function PromptListClient({ prompts, error }: PromptListClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all")
  const [sortOption, setSortOption] = useState<SortOption>("recent")
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const categories = useMemo(() => {
    const allCategories = prompts.map((prompt) => prompt.category || "Uncategorized")
    return Array.from(new Set(allCategories))
  }, [prompts])

  const filteredPrompts = useMemo(() => {
    let result = prompts

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (prompt) =>
          prompt.name.toLowerCase().includes(term) ||
          prompt.prompt.toLowerCase().includes(term) ||
          prompt.category?.toLowerCase().includes(term),
      )
    }

    if (selectedCategory !== "all") {
      result = result.filter((prompt) => (prompt.category || "Uncategorized") === selectedCategory)
    }

    if (favoritesOnly) {
      result = result.filter((prompt) => Boolean(prompt.isFavorite))
    }

    const sorted = [...result]
    switch (sortOption) {
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "usage":
        sorted.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        break
      case "favorite":
        sorted.sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite) || (b.usageCount || 0) - (a.usageCount || 0))
        break
      case "recent":
      default:
        sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        break
    }

    return sorted
  }, [favoritesOnly, prompts, searchTerm, selectedCategory, sortOption])

  if (error) {
    return (
      <Alert className="mt-6" variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <div>
              <strong>Database Error:</strong> {error}
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer font-medium hover:underline">Show database setup instructions</summary>
              <div className="mt-3 rounded-md bg-slate-900 p-3 font-mono text-xs text-slate-100">
                <pre>{`CREATE TABLE IF NOT EXISTS legalprompt (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  category VARCHAR(100),
  "systemMessage" TEXT,
  "usageCount" INTEGER DEFAULT 0,
  "isFavorite" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}</pre>
              </div>
            </details>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (!filteredPrompts.length) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Star className="h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">No prompts match your filters yet.</p>
        <Link href="/prompts/new">
          <Button className="mt-4">Create your first prompt</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-4 rounded-lg border bg-card p-4 shadow-sm md:grid-cols-4">
        <div className="md:col-span-2">
          <Label className="sr-only" htmlFor="search-prompts">
            Search prompts
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-prompts"
              placeholder="Search by title, content, or category"
              className="pl-9"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Category</Label>
          <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value)}>
            <SelectTrigger>
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

        <div className="space-y-1">
          <Label>Sort by</Label>
          <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="usage">Most used</SelectItem>
              <SelectItem value="favorite">Favorites first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end justify-end gap-2">
          <Button
            variant={favoritesOnly ? "default" : "outline"}
            type="button"
            onClick={() => setFavoritesOnly((prev) => !prev)}
            className="w-full md:w-auto"
          >
            <Star className="mr-2 h-4 w-4" />
            {favoritesOnly ? "Showing favorites" : "Filter favorites"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setFavoritesOnly(false)
              setSelectedCategory("all")
              setSortOption("recent")
            }}
            className="hidden md:inline-flex"
          >
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPrompts.map((prompt) => (
          <div
            key={prompt.id}
            className="group relative flex h-full flex-col rounded-lg border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="absolute right-3 top-3 text-amber-500">
              <Star className={prompt.isFavorite ? "h-5 w-5 fill-amber-400" : "h-5 w-5 text-muted-foreground"} />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">{new Date(prompt.createdAt).toLocaleDateString()}</p>
              <h3 className="text-lg font-semibold leading-tight group-hover:text-primary">{prompt.name}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {prompt.prompt.startsWith("# ") ? prompt.prompt.substring(2) : prompt.prompt}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">
                  {prompt.category || "Uncategorized"}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  {prompt.usageCount ?? 0} uses
                </span>
                {prompt.isFavorite && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-700">
                    <Star className="h-3.5 w-3.5 fill-current" /> Favorite
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Link href={`/prompts/${prompt.id}`} passHref>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
