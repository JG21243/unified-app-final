"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface FavoritesContextType {
  favorites: number[]
  addFavorite: (id: number) => void
  removeFavorite: (id: number) => void
  isFavorite: (id: number) => boolean
  toggleFavorite: (id: number) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem("legalPromptFavorites")
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites))
      } catch (error) {
        console.error("Error parsing favorites from localStorage:", error)
        setFavorites([])
      }
    }
    setIsLoaded(true)
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("legalPromptFavorites", JSON.stringify(favorites))
    }
  }, [favorites, isLoaded])

  const addFavorite = (id: number) => {
    setFavorites((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((favId) => favId !== id))
  }

  const isFavorite = (id: number) => {
    return favorites.includes(id)
  }

  const toggleFavorite = (id: number) => {
    if (isFavorite(id)) {
      removeFavorite(id)
    } else {
      addFavorite(id)
    }
  }

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}

