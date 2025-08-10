"use client"

import { useOptimistic, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Copy, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"

interface Prompt {
  id: string
  name: string
  prompt: string
  category: string
  isFavorite?: boolean
}

interface PromptCardOptimisticProps {
  prompt: Prompt
  onFavorite?: (id: string) => Promise<void>
  onDuplicate?: (id: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

type OptimisticAction = 
  | { type: 'favorite'; id: string }
  | { type: 'duplicate'; id: string }
  | { type: 'delete'; id: string }

export function PromptCardOptimistic({ 
  prompt, 
  onFavorite, 
  onDuplicate, 
  onDelete 
}: PromptCardOptimisticProps) {
  const [isPending, startTransition] = useTransition()
  
  const [optimisticPrompt, addOptimisticUpdate] = useOptimistic(
    prompt,
    (state: Prompt, action: OptimisticAction) => {
      switch (action.type) {
        case 'favorite':
          return { ...state, isFavorite: !state.isFavorite }
        case 'duplicate':
          return state // No immediate UI change for duplicate
        case 'delete':
          return { ...state, isDeleting: true } as Prompt & { isDeleting: boolean }
        default:
          return state
      }
    }
  )

  const handleFavorite = () => {
    if (!onFavorite) return
    
    startTransition(async () => {
      addOptimisticUpdate({ type: 'favorite', id: prompt.id })
      try {
        await onFavorite(prompt.id)
      } catch (error) {
        console.error('Failed to toggle favorite:', error)
        // The UI will revert automatically on error
      }
    })
  }

  const handleDuplicate = () => {
    if (!onDuplicate) return
    
    startTransition(async () => {
      addOptimisticUpdate({ type: 'duplicate', id: prompt.id })
      try {
        await onDuplicate(prompt.id)
      } catch (error) {
        console.error('Failed to duplicate prompt:', error)
      }
    })
  }

  const handleDelete = () => {
    if (!onDelete) return
    
    startTransition(async () => {
      addOptimisticUpdate({ type: 'delete', id: prompt.id })
      try {
        await onDelete(prompt.id)
      } catch (error) {
        console.error('Failed to delete prompt:', error)
      }
    })
  }

  const isDeleting = (optimisticPrompt as Prompt & { isDeleting?: boolean }).isDeleting

  return (
    <Card className={`group transition-all duration-200 hover:shadow-md hover:border-primary/20 ${
      isDeleting ? 'opacity-50 scale-95' : ''
    }`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
              {optimisticPrompt.name}
            </h3>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onFavorite && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleFavorite}
                  disabled={isPending}
                >
                  <Heart 
                    className={`h-4 w-4 transition-colors ${
                      optimisticPrompt.isFavorite 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-muted-foreground hover:text-red-500'
                    }`} 
                  />
                </Button>
              )}
              
              {onDuplicate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleDuplicate}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground hover:text-blue-500" />
                  )}
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {optimisticPrompt.prompt.startsWith("# ")
              ? optimisticPrompt.prompt.substring(2)
              : optimisticPrompt.prompt}
          </p>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
          <Badge variant="secondary" className="text-xs">
            {optimisticPrompt.category || 'Uncategorized'}
          </Badge>
          
          <Link href={`/prompts/${optimisticPrompt.id}`}>
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Deleting...
                </>
              ) : (
                'View Details'
              )}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// Optimistic prompt list component
interface OptimisticPromptListProps {
  initialPrompts: Prompt[]
  onFavorite?: (id: string) => Promise<void>
  onDuplicate?: (id: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function OptimisticPromptList({ 
  initialPrompts, 
  onFavorite, 
  onDuplicate, 
  onDelete 
}: OptimisticPromptListProps) {
  const [optimisticPrompts, addOptimisticPrompt] = useOptimistic(
    initialPrompts,
    (state: Prompt[], newPrompt: Prompt) => [...state, newPrompt]
  )

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {optimisticPrompts.map((prompt) => (
        <PromptCardOptimistic
          key={prompt.id}
          prompt={prompt}
          onFavorite={onFavorite}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}