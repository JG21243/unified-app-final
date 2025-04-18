"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { createLegalPrompt } from "@/app/actions"
import { Loader2 } from "lucide-react"

interface CreatePromptFormProps {
  categories: string[]
}

export function CreatePromptForm({ categories }: CreatePromptFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    prompt: "",
    category: "",
    systemMessage: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createLegalPrompt(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Prompt created successfully",
        })
        router.push("/")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to create prompt",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating prompt:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Enhance create prompt form for better mobile responsiveness
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          name="prompt"
          value={formData.prompt}
          onChange={handleChange}
          placeholder="Enter your prompt text here. Use {{variable_name}} for variables."
          className="min-h-[150px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="systemMessage">System Message (Optional)</Label>
        <Textarea
          id="systemMessage"
          name="systemMessage"
          value={formData.systemMessage}
          onChange={handleChange}
          placeholder="Optional system message for the AI model"
          className="min-h-[100px]"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Prompt"
          )}
        </Button>
      </div>
    </form>
  )
}

