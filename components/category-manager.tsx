"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  addCategory,
  renameCategory,
  deleteCategory,
} from "@/app/actions"
import { motion, AnimatePresence } from "framer-motion"

interface CategoryManagerProps {
  initialCategories: string[]
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [newCategory, setNewCategory] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const router = useRouter()

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return

    try {
      const result = await addCategory(newCategory)
      if (!result.success) {
        throw new Error(result.error)
      }

      setCategories([...categories, newCategory])
      setNewCategory("")
      toast({
        title: "Category added",
        description: `The category "${newCategory}" has been added.`,
      })
      router.refresh()
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "Error",
        description: "Failed to add the category.",
        variant: "destructive",
      })
    }
  }

  const handleEditCategory = async (index: number) => {
    if (!editValue.trim() || editValue === categories[index]) {
      setEditingIndex(null)
      return
    }

    const oldCategory = categories[index]

    try {
      const result = await renameCategory(oldCategory, editValue)
      if (!result.success) {
        throw new Error(result.error)
      }

      const newCategories = [...categories]
      newCategories[index] = editValue
      setCategories(newCategories)
      setEditingIndex(null)

      toast({
        title: "Category updated",
        description: `The category has been renamed from "${oldCategory}" to "${editValue}".`,
      })
      router.refresh()
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Error",
        description: "Failed to update the category.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async () => {
    if (deleteIndex === null) return

    const categoryToDelete = categories[deleteIndex]

    try {
      const result = await deleteCategory(categoryToDelete)
      if (!result.success) {
        throw new Error(result.error)
      }

      const newCategories = categories.filter((_, i) => i !== deleteIndex)
      setCategories(newCategories)
      setDeleteIndex(null)

      toast({
        title: "Category deleted",
        description: `The category "${categoryToDelete}" has been deleted. All associated prompts have been moved to "Uncategorized".`,
      })
      router.refresh()
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete the category.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>Categories</CardTitle>
          <p className="text-sm text-muted-foreground">Manage your prompt categories</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 shadow-sm"
            />
            <Button onClick={handleAddCategory} className="gap-2 shadow-sm w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {categories.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-muted">
                <p className="text-sm text-muted-foreground">No categories found. Add your first category above.</p>
              </div>
            ) : (
              <AnimatePresence>
                {categories.map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border/50 hover:border-border transition-colors"
                  >
                    {editingIndex === index ? (
                      <div className="flex-1 flex flex-col sm:flex-row gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                          className="shadow-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCategory(index)}
                            className="w-full sm:w-auto"
                          >
                            <Save className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Save</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingIndex(null)}
                            className="w-full sm:w-auto"
                          >
                            <X className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Cancel</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium truncate pr-2">{category}</span>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingIndex(index)
                              setEditValue(category)
                            }}
                            className="hover:bg-muted"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteIndex(index)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent className="shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the category and move all associated prompts to "Uncategorized".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

