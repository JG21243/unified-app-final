"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { useVirtualScroll, useIntersectionObserver } from '@/hooks/use-performance'
import { PromptCardSkeleton } from '@/components/loading-states'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  loadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  className?: string
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  loadMore,
  hasMore = false,
  isLoading = false,
  className = ""
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex
  } = useVirtualScroll(items, itemHeight, containerHeight)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Intersection observer for infinite loading
  const loadMoreRef = useIntersectionObserver(
    useCallback(() => {
      if (hasMore && !isLoading && loadMore) {
        loadMore()
      }
    }, [hasMore, isLoading, loadMore]),
    { threshold: 0.1 }
  )

  const scrollToTop = useCallback(() => {
    const container = document.getElementById('virtualized-container')
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const showScrollToTop = scrollTop > containerHeight

  return (
    <div className={`relative ${className}`}>
      <div
        id="virtualized-container"
        className="overflow-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            {visibleItems.map((item, index) => (
              <div
                key={startIndex + index}
                style={{ height: itemHeight }}
                className="flex items-stretch"
              >
                {renderItem(item, startIndex + index)}
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="p-4 flex justify-center">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <PromptCardSkeleton key={`loading-${i}`} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Load more trigger */}
            {hasMore && !isLoading && (
              <div ref={loadMoreRef} className="h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollToTop && (
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-background/80 backdrop-blur-sm"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// Optimized grid component for prompt cards
interface VirtualizedPromptGridProps {
  prompts: any[]
  onLoadMore?: () => void
  hasMore?: boolean
  isLoading?: boolean
  renderPrompt: (prompt: any) => React.ReactNode
}

export function VirtualizedPromptGrid({
  prompts,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  renderPrompt
}: VirtualizedPromptGridProps) {
  const itemsPerRow = 3 // lg:grid-cols-3
  const itemHeight = 200 // Approximate card height
  const containerHeight = 600 // Viewport height for prompts

  // Group prompts into rows for virtualization
  const rows = useMemo(() => {
    const rowData = []
    for (let i = 0; i < prompts.length; i += itemsPerRow) {
      rowData.push(prompts.slice(i, i + itemsPerRow))
    }
    return rowData
  }, [prompts, itemsPerRow])

  const renderRow = useCallback((row: any[], index: number) => (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4">
      {row.map((prompt) => renderPrompt(prompt))}
      {/* Fill empty slots in the last row */}
      {row.length < itemsPerRow && 
        Array.from({ length: itemsPerRow - row.length }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))
      }
    </div>
  ), [renderPrompt, itemsPerRow])

  return (
    <VirtualizedList
      items={rows}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      renderItem={renderRow}
      loadMore={onLoadMore}
      hasMore={hasMore}
      isLoading={isLoading}
      className="mt-6"
    />
  )
}

// Memoized prompt card for performance
export const MemoizedPromptCard = React.memo(function PromptCard({ 
  prompt, 
  onClick 
}: { 
  prompt: any
  onClick?: () => void 
}) {
  return (
    <div
      className="group bg-card rounded-lg border p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-3">
        <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
          {prompt.name}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {prompt.prompt?.startsWith("# ")
            ? prompt.prompt.substring(2)
            : prompt.prompt}
        </p>
      </div>
      
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/50">
        <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
          {prompt.category || 'Uncategorized'}
        </span>
        
        <span className="text-xs text-muted-foreground">
          Click to view
        </span>
      </div>
    </div>
  )
})