"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { LegalPrompt } from "@/app/actions"

interface ExportPromptsProps {
  prompts: LegalPrompt[]
}

export function ExportPrompts({ prompts }: ExportPromptsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)

    try {
      // Create a JSON blob
      const data = JSON.stringify(prompts, null, 2)
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      // Create a download link and trigger it
      const link = document.createElement("a")
      link.href = url
      link.download = `legal-prompts-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting prompts:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting || prompts.length === 0} className="gap-2">
      <Download className="h-4 w-4" />
      {isExporting ? "Exporting..." : "Export Prompts"}
    </Button>
  )
}

