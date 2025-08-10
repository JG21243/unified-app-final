import { useState, useEffect, useCallback, useRef } from 'react'

// Debounce hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Optimized search hook with caching
export function useOptimizedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  debounceMs: number = 300
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const debouncedQuery = useDebounce(query, debounceMs)
  const cache = useRef<Map<string, T[]>>(new Map())
  const abortController = useRef<AbortController | null>(null)

  const search = useCallback(async (searchQuery: string) => {
    // Check cache first
    if (cache.current.has(searchQuery)) {
      setResults(cache.current.get(searchQuery)!)
      setIsLoading(false)
      return
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort()
    }

    abortController.current = new AbortController()
    setIsLoading(true)
    setError(null)

    try {
      const searchResults = await searchFn(searchQuery)
      
      // Cache the results
      cache.current.set(searchQuery, searchResults)
      
      // Limit cache size to prevent memory leaks
      if (cache.current.size > 50) {
        const firstKey = cache.current.keys().next().value
        cache.current.delete(firstKey)
      }
      
      setResults(searchResults)
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [searchFn])

  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery)
    } else {
      setResults([])
      setIsLoading(false)
    }
  }, [debouncedQuery, search])

  const clearCache = useCallback(() => {
    cache.current.clear()
  }, [])

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearCache
  }
}

// Virtual scrolling hook for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  )
  
  const visibleItems = items.slice(startIndex, endIndex)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    startIndex,
    endIndex
  }
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback()
      }
    }, options)

    observer.observe(target)

    return () => {
      observer.unobserve(target)
    }
  }, [callback, options])

  return targetRef
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const startTime = useRef(Date.now())

  useEffect(() => {
    renderCount.current += 1
  })

  useEffect(() => {
    return () => {
      const endTime = Date.now()
      const renderTime = endTime - startTime.current
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} Performance:`, {
          renders: renderCount.current,
          totalTime: renderTime,
          avgTimePerRender: renderTime / renderCount.current
        })
      }
    }
  }, [componentName])

  return {
    renderCount: renderCount.current
  }
}