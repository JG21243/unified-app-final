"use client"

import { useState } from "react"
import { usePrompts } from "@/hooks/use-prompts"
import { Combobox } from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useFavorites } from "@/components/favorites-provider"

export function ChatPromptSelector() {
  const { prompts } = usePrompts()
  const [category, setCategory] = useState<string>("all")
  const [selectedPrompt, setSelectedPrompt] = useState<string>("")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { isFavorite } = useFavorites()

  const categories = Array.from(
    new Set(prompts.map((p) => p.category).filter(Boolean)),
  )

  const filteredPrompts = prompts.filter((p) => {
    if (category !== "all" && p.category !== category) return false
    if (showFavoritesOnly && !isFavorite(p.id)) return false
    return true
  })

  const handlePromptSelect = (value: string) => {
    setSelectedPrompt(value)
    const prompt = prompts.find((p) => String(p.id) === value)
    if (!prompt) return
    const textarea = document.getElementById(
      "prompt-textarea",
    ) as HTMLTextAreaElement | null
    if (textarea) {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value",
      )?.set
      setter?.call(textarea, prompt.prompt)
      const ev = new Event("input", { bubbles: true })
      textarea.dispatchEvent(ev)
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur p-4 border-b border-gray-200 dark:border-gray-800 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Combobox
          options={filteredPrompts.map((p) => ({
            value: String(p.id),
            label: p.name,
          }))}
          value={selectedPrompt}
          onChange={handlePromptSelect}
          placeholder="Select a prompt"
          className="w-64"
          disabled={filteredPrompts.length === 0}
        />
        {categories.length > 1 && (
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="ml-auto flex items-center space-x-2">
          <Label htmlFor="fav-switch" className="text-sm">
            Favorites
          </Label>
          <Switch
            id="fav-switch"
            checked={showFavoritesOnly}
            onCheckedChange={setShowFavoritesOnly}
          />
        </div>
      </div>
    </div>
  )
}

export default ChatPromptSelector
