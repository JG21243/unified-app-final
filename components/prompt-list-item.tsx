"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  Eye,
  Pencil,
  Calendar,
  Variable,
  MessageSquare,
  Star,
  Copy,
  MoreHorizontal,
  Trash2,
  CopyIcon as Duplicate,
  ExternalLink,
  Check,
} from "lucide-react"
import type { LegalPrompt } from "@/app/actions"
import { cn } from "@/lib/utils"
import { extractVariables } from "@/lib/validation-utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useFavorites } from "@/components/favorites-provider"

interface PromptListItemProps {
  prompt: LegalPrompt
  isSelected?: boolean
  onSelect?: (id: number) => void
  onFavorite?: (id: number, isFavorite: boolean) => void
  onDuplicate?: (id: number) => void
  onDelete?: (id: number) => void
}

export function PromptListItem({
  prompt,
  isSelected = false,
  onSelect,
  onFavorite,
  onDuplicate,
  onDelete,
}: PromptListItemProps) {
  const formattedDate = formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })
  const [copied, setCopied] = useState(false)

  // Extract variables from prompt for display
  const variables = prompt.variables || extractVariables(prompt.prompt)
  const hasSystemMessage = !!prompt.systemMessage

  const { isFavorite, toggleFavorite } = useFavorites()
  const isPromptFavorite = isFavorite(prompt.id)

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const nextState = !isPromptFavorite
    toggleFavorite(prompt.id)
    onFavorite?.(prompt.id, nextState)

    toast({
      title: isPromptFavorite ? "Removed from favorites" : "Added to favorites",
      description: `"${prompt.name}" has been ${isPromptFavorite ? "removed from" : "added to"} your favorites.`,
      duration: 3000,
    })
  }

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    navigator.clipboard.writeText(prompt.prompt)
    setCopied(true)

    toast({
      title: "Copied to clipboard",
      description: "Prompt text has been copied to your clipboard.",
      duration: 3000,
    })

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 transition-all duration-200 group hover:shadow-md",
          "border-border/60 hover:border-primary/30",
          isSelected && "ring-2 ring-primary/40 border-primary/40 shadow-sm",
          isPromptFavorite && "border-amber-300/50",
        )}
      >
        {/* Selection checkbox and favorite button in a row on mobile */}
        <div className="flex items-center mb-2 sm:mb-0 sm:mr-4">
          {onSelect && (
            <div className="mr-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(prompt.id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${prompt.name}`}
                className="h-4 w-4 border-2 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </div>
          )}

          <button
            onClick={handleFavorite}
            className={cn(
              "p-1.5 rounded-full transition-colors mr-3",
              isPromptFavorite
                ? "text-amber-400 bg-amber-100 dark:bg-amber-900/30"
                : "text-muted-foreground/40 hover:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30",
            )}
            aria-label={isPromptFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className="h-4 w-4" fill={isPromptFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 items-center">
            <h3 className="font-medium text-base truncate">{prompt.name}</h3>
            <Badge
              variant="secondary"
              className="shrink-0 font-medium text-xs px-2 py-0.5 bg-secondary/70 hover:bg-secondary"
            >
              {prompt.category}
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground line-clamp-1 mt-2">{prompt.prompt}</div>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>

            {variables.length > 0 && (
              <div className="flex items-center gap-1">
                <Variable className="h-3 w-3" />
                <span>
                  {variables.length} {variables.length === 1 ? "variable" : "variables"}
                </span>
              </div>
            )}

            {hasSystemMessage && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>System message</span>
              </div>
            )}

            {prompt.usageCount !== undefined && prompt.usageCount > 0 && (
              <div className="flex items-center gap-1">
                <span>Used {prompt.usageCount} times</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions - scrollable container for mobile */}
        <div className="flex items-center gap-1 sm:gap-2 mt-3 sm:mt-0 sm:ml-4 overflow-x-auto pb-1 sm:pb-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={handleCopyPrompt}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? "Copied!" : "Copy prompt text"}</p>
            </TooltipContent>
          </Tooltip>

          <Button asChild variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
            <Link href={`/prompts/${prompt.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
            <Link href={`/prompts/${prompt.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild className="gap-2">
                <Link href={`/prompts/${prompt.id}`}>
                  <ExternalLink className="h-4 w-4" />
                  Open in new tab
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(prompt.id)} className="gap-2">
                <Duplicate className="h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFavorite} className="gap-2">
                <Star className="h-4 w-4" fill={isPromptFavorite ? "currentColor" : "none"} />
                {isPromptFavorite ? "Remove from favorites" : "Add to favorites"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(prompt.id)}
                className="text-destructive focus:text-destructive gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </TooltipProvider>
  )
}

