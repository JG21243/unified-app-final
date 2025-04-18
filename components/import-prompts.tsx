"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createLegalPrompt, type LegalPrompt } from "@/app/actions"
import { Progress } from "@/components/ui/progress"

export function ImportPrompts() {
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [totalPrompts, setTotalPrompts] = useState(0)
  const [importedCount, setImportedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Read the file
      const text = await file.text()
      const prompts = JSON.parse(text) as LegalPrompt[]

      if (!Array.isArray(prompts) || prompts.length === 0) {
        toast({
          title: "Invalid file format",
          description: "The file does not contain valid prompt data.",
          variant: "destructive",
        })
        return
      }

      setTotalPrompts(prompts.length)
      setIsImporting(true)
      setProgress(0)
      setImportedCount(0)

      // Import prompts one by one
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i]
        try {
          await createLegalPrompt({
            name: prompt.name,
            prompt: prompt.prompt,
            category: prompt.category,
            systemMessage: prompt.systemMessage ?? undefined,
          })
          setImportedCount((prev) => prev + 1)
          setProgress(Math.round(((i + 1) / prompts.length) * 100))
        } catch (error) {
          console.error(`Error importing prompt ${prompt.name}:`, error)
        }
      }

      toast({
        title: "Import complete",
        description: `Successfully imported ${importedCount} out of ${prompts.length} prompts.`,
      })

      router.refresh()
      setIsOpen(false)
    } catch (error) {
      console.error("Error parsing file:", error)
      toast({
        title: "Error",
        description: "Failed to parse the import file. Please ensure it is valid JSON.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import Prompts
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Prompts</DialogTitle>
          <DialogDescription>
            Upload a JSON file containing prompts to import. The file should be in the same format as the exported
            prompts.
          </DialogDescription>
        </DialogHeader>

        {isImporting ? (
          <div className="space-y-4 py-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Importing prompts...</span>
              <span>
                {importedCount} of {totalPrompts}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <div className="py-4">
            <label htmlFor="import-file" className="sr-only">Upload prompts JSON file</label>
            <input
              id="import-file"
              type="file"
              accept=".json"
              aria-label="Upload prompts JSON file"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isImporting}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

