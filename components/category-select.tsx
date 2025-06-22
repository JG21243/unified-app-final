"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CategorySelectProps {
  categories: string[]
  value: string
  onChange: (category: string) => void
  allowCreate?: boolean
}

export function CategorySelect({ categories, value, onChange, allowCreate }: CategorySelectProps) {
  const [newCategory, setNewCategory] = useState("")
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)

  useEffect(() => {
    if (!value) {
      setNewCategory("")
      setShowNewCategoryInput(false)
    }
  }, [value])

  const handleValueChange = (value: string) => {
    if (value === "new" && allowCreate) {
      setShowNewCategoryInput(true)
    } else {
      setShowNewCategoryInput(false)
      onChange(value)
    }
  }

  const handleCreateCategory = () => {
    if (newCategory.trim()) {
      onChange(newCategory.trim())
      setNewCategory("")
      setShowNewCategoryInput(false)
    }
  }

  return (
    <div>
      {showNewCategoryInput ? (
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="New category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-32"
          />
          <Button size="sm" onClick={handleCreateCategory}>
            Create
          </Button>
        </div>
      ) : (
        <Select onValueChange={handleValueChange} value={value}>
          {/* Approximate 180px width using the closest spacing utility */}
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
            {allowCreate && <SelectItem value="new">+ New Category</SelectItem>}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

