"use client"

import { useState } from "react"
import { PromptCard } from "@/components/prompt-card"
import { BulkActions } from "@/components/bulk-actions"

interface PromptSelectorProps {
  prompts: any[]
}

export function PromptSelector({ prompts }: PromptSelectorProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedPrompts((prev) => {
      if (selected) {
        return [...prev, id]
      } else {
        return prev.filter((promptId) => promptId !== id)
      }
    })
  }

  const handleBulkActionComplete = () => {
    setSelectedPrompts([])
  }

  return (
    <div>
      {selectedPrompts.length > 0 && (
        <div className="mb-4">
          <BulkActions selectedPrompts={selectedPrompts} onComplete={handleBulkActionComplete} />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            selectable
            onSelect={(selected) => handleSelect(prompt.id, selected)}
            selected={selectedPrompts.includes(prompt.id)}
          />
        ))}
      </div>
    </div>
  )
}

