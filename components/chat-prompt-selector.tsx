"use client"

import { useEffect, useState } from "react"
import { getPrompts, type LegalPrompt } from "@/app/actions"
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

interface ChatPromptSelectorProps {
  onSelect: (promptText: string) => void
}

export default function ChatPromptSelector({ onSelect }: ChatPromptSelectorProps) {
  const [prompts, setPrompts] = useState<LegalPrompt[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [category, setCategory] = useState("")
  const [showFavorites, setShowFavorites] = useState(false)
  const { isFavorite } = useFavorites()

  useEffect(() => {
    ;(async () => {
      const { prompts } = await getPrompts()
      setPrompts(prompts)
    })()
  }, [])

  const categories = Array.from(new Set(prompts.map(p => p.category))).filter(Boolean)
  const filtered = prompts.filter(
    p => (!category || p.category === category) && (!showFavorites || isFavorite(p.id)),
  )

  const options = filtered.map(p => ({ value: p.id.toString(), label: p.name }))

  const handleChange = (id: string) => {
    setSelectedId(id)
    const prompt = prompts.find(p => p.id.toString() === id)
    if (prompt) {
      onSelect(prompt.prompt)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:max-w-xs">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch id="fav-switch" checked={showFavorites} onCheckedChange={setShowFavorites} />
          <Label htmlFor="fav-switch" className="text-sm">
            Favorites
          </Label>
        </div>
      </div>
      <Combobox
        options={options}
        value={selectedId}
        onChange={handleChange}
        placeholder="Choose a prompt..."
        emptyMessage="No prompts found"
        className="w-full"
      />
    </div>
  )
}
