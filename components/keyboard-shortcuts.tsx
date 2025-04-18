"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts when not in an input, textarea, or select
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return
      }

      // Keyboard shortcuts
      switch (e.key) {
        case "?":
          // Show keyboard shortcuts dialog
          setIsOpen(true)
          break
        case "n":
          // New prompt
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            router.push("/?tab=create")
          }
          break
        case "h":
          // Go home
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            router.push("/")
          }
          break
        case "f":
          // Focus search
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
            if (searchInput) {
              searchInput.focus()
            }
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Keyboard className="h-4 w-4" />
          <span className="sr-only">Keyboard shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate the application more efficiently.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">?</div>
            <div>Show keyboard shortcuts</div>

            <div className="font-medium">Ctrl/⌘ + N</div>
            <div>Create new prompt</div>

            <div className="font-medium">Ctrl/⌘ + H</div>
            <div>Go to home page</div>

            <div className="font-medium">Ctrl/⌘ + F</div>
            <div>Focus search</div>

            <div className="font-medium">←, →</div>
            <div>Navigate pagination</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

