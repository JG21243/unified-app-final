"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash } from "lucide-react"

import { bulkDeletePrompts } from "@/app/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface BulkActionsProps {
  selectedPrompts: string[]
  onComplete?: () => void
}

export function BulkActions({ selectedPrompts = [], onComplete }: BulkActionsProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!selectedPrompts || selectedPrompts.length === 0) {
      toast({
        title: "No prompts selected",
        description: "Please select at least one prompt to delete.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDeleting(true)
      await bulkDeletePrompts(selectedPrompts)
      toast({
        title: "Prompts deleted",
        description: `Successfully deleted ${selectedPrompts.length} prompt${selectedPrompts.length === 1 ? "" : "s"}.`,
      })
      setOpen(false)
      if (onComplete) {
        onComplete()
      }
      router.refresh()
    } catch (error) {
      console.error("Error deleting prompts:", error)
      toast({
        title: "Error",
        description: "Failed to delete prompts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Don't render the component if no prompts are selected
  if (!selectedPrompts || selectedPrompts.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedPrompts.length} prompt{selectedPrompts.length === 1 ? "" : "s"} selected
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prompts</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPrompts.length} prompt{selectedPrompts.length === 1 ? "" : "s"}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

