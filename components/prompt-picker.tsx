"use client"

import { Command, CommandInput, CommandItem, CommandList } from "cmdk"
import { useEffect, useState } from "react"
import { type LegalPrompt } from "@/app/actions"
import { usePrompts } from "@/hooks/use-prompts"
import useConversationStore from "@/stores/useConversationStore"

interface PromptPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PromptPicker({ open, onOpenChange }: PromptPickerProps) {
  const { prompts } = usePrompts()
  const [query, setQuery] = useState("")
  const { setCurrentPromptId } = useConversationStore()

  useEffect(() => {
    if (open) {
      setQuery("")
    }
  }, [open])

  const filtered = prompts.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  )

  const handleSelect = (prompt: LegalPrompt) => {
    const textarea = document.getElementById("prompt-textarea") as HTMLTextAreaElement | null
    if (textarea) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )?.set
      setter?.call(textarea, prompt.prompt)
      textarea.dispatchEvent(new Event("input", { bubbles: true }))
      textarea.focus()
    }
    setCurrentPromptId(prompt.id)
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <Command className="relative z-10 w-11/12 max-w-md rounded-md bg-popover p-2 shadow-lg">
        <CommandInput
          autoFocus
          placeholder="Search prompts..."
          value={query}
          onValueChange={setQuery}
          className="border-b"
        />
        <CommandList className="max-h-60 overflow-y-auto">
          {filtered.map((prompt) => (
            <CommandItem key={prompt.id} onSelect={() => handleSelect(prompt)}>
              {prompt.name}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  )
}
