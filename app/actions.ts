"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { z } from "zod"

import { sql } from "@/lib/db"
import { promptSchema } from "@/lib/validations/prompt"
import { sanitizeInput } from "@/lib/validation-utils"
import fallbackPrompts from "@/scripts/prompts-data.json"

export type LegalPrompt = {
  id: number
  name: string
  prompt: string
  category: string
  systemMessage: string | null
  createdAt: string
  updatedAt?: string
  variables?: string[]
  usageCount?: number
  isFavorite?: boolean
}

export type PromptError = {
  message: string
  errors?: Record<string, string> // For Zod field errors, string array might be more direct from .flatten()
  code?: string
}

export async function getPrompts(): Promise<{ prompts: LegalPrompt[]; error: string | null }> {
  try {
    // When the database connection isn't configured, fall back to bundled prompt data
    // Access the variable dynamically so its value is read at runtime. Next.js
    // may inline environment variables if dot notation is used.
    if (!process.env["DATABASE_URL"]) {
      console.warn("DATABASE_URL is not set. Loading fallback prompts")
      const prompts: LegalPrompt[] = (fallbackPrompts as any[]).map((p, i) => ({
        id: i + 1,
        name: p.title,
        prompt: p.prompt,
        category: p.category,
        systemMessage: null,
        createdAt: new Date().toISOString(),
        variables: [],
        usageCount: 0,
        isFavorite: false,
      }))
      console.log(`Loaded ${prompts.length} fallback prompts`)
      return { prompts, error: "Database connection not configured" }
    }

    const result = await sql`
      SELECT id, name, prompt, category, "systemMessage", "createdAt", "updatedAt"
      FROM legalprompt
      ORDER BY "createdAt" DESC
    `
    const prompts: LegalPrompt[] = result.map(p => ({
      ...p,
      variables: p.prompt ? extractVariables(p.prompt as string) : [],
      usageCount: p.usageCount || 0,
      isFavorite: p.isFavorite || false
    })) as LegalPrompt[]

    console.log(`Fetched ${prompts.length} prompts from database`)

    return { prompts, error: null }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Failed to fetch prompts:", error)
    const prompts: LegalPrompt[] = (fallbackPrompts as any[]).map((p, i) => ({
      id: i + 1,
      name: p.title,
      prompt: p.prompt,
      category: p.category,
      systemMessage: null,
      createdAt: new Date().toISOString(),
      variables: [],
      usageCount: 0,
      isFavorite: false,
    }))
    console.log(`Using ${prompts.length} fallback prompts due to error`)
    return {
      prompts,
      error: `Failed to fetch prompts: ${error.message}`,
    }
  }
}

export async function getPromptById(id: number): Promise<LegalPrompt | undefined> {
  try {
    const result = await sql`
      SELECT id, name, prompt, category, "systemMessage", "createdAt", "updatedAt"
      FROM legalprompt
      WHERE id = ${id}
    `
    if (result.length === 0) return undefined
    const p = result[0]
    return {
      ...p,
      variables: p.prompt ? extractVariables(p.prompt as string) : [],
      usageCount: p.usageCount || 0,
      isFavorite: p.isFavorite || false
    } as LegalPrompt | undefined
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error(`Failed to fetch prompt by ID ${id}:`, error)
    throw new Error(`Failed to fetch prompt by ID ${id}: ${error.message}`)
  }
}


export async function getLegalPrompts(options?: {
  search?: string
  category?: string[]
  sortBy?: string
  limit?: number
  offset?: number
  dateRange?: { from?: string; to?: string }
  includeSystemMessages?: boolean
  favoritesOnly?: boolean
}): Promise<{ prompts: LegalPrompt[]; total: number }> {
  try {
    const limit = options?.limit || 10
    const offset = options?.offset || 0

    const result = await sql`
      SELECT id, name, prompt, category, "systemMessage", "createdAt", "updatedAt"
      FROM legalprompt
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const prompts: LegalPrompt[] = result.map(p => ({
      ...p,
      variables: p.prompt ? extractVariables(p.prompt as string) : [],
      usageCount: p.usageCount || 0,
      isFavorite: p.isFavorite || false
    })) as LegalPrompt[]

    const countResult = await sql`SELECT COUNT(*) as total FROM legalprompt`
    const total = Number.parseInt(countResult[0].total as string)

    return { prompts, total }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Error fetching prompts:", error)
    return { prompts: [], total: 0 }
  }
}


export async function getLegalPromptById(id: number): Promise<LegalPrompt | null> {
  try {
    const results = await sql`
      SELECT id, name, prompt, category, "systemMessage", "createdAt", "updatedAt"
      FROM legalprompt 
      WHERE id = ${id}
    `

    if (results.length === 0) {
      return null
    }

    const p = results[0]
    const variables = p.prompt ? extractVariables(p.prompt as string) : []

    const legalPrompt: LegalPrompt = {
      id: p.id as number,
      name: p.name as string,
      prompt: p.prompt as string,
      category: p.category as string,
      systemMessage: p.systemMessage as string | null,
      createdAt: p.createdAt as string,
      updatedAt: p.updatedAt as string | undefined,
      variables,
      usageCount: p.usageCount || 0,
      isFavorite: p.isFavorite || false,
    }
    return legalPrompt
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error(`Error fetching prompt ${id}:`, error)
    return null
  }
}

export async function createPrompt(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const content = formData.get("content") as string
    const category = formData.get("category") as string

    const createdAt = new Date().toISOString()

    await sql`
      INSERT INTO legalprompt (name, prompt, category, "systemMessage", "createdAt")
      VALUES (${title}, ${description}, ${category}, ${content}, ${createdAt})
    `

    revalidatePath("/")
    redirect("/")
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Failed to create prompt:", error)
    throw new Error(`Failed to create prompt: ${error.message}`)
  }
}


export async function createLegalPrompt(
  data: z.infer<typeof promptSchema>,
): Promise<{ success: boolean; data?: LegalPrompt; error?: PromptError }> {
  try {
    const validationResult = promptSchema.safeParse(data)

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors
      const formattedErrors: Record<string, string> = {}
      for (const key in fieldErrors) {
        const errorArray = fieldErrors[key as keyof typeof fieldErrors]
        if (errorArray && errorArray.length > 0) {
          formattedErrors[key] = errorArray[0]
        }
      }
      return {
        success: false,
        error: {
          message: "Validation failed",
          errors: formattedErrors,
          code: "VALIDATION_ERROR",
        },
      }
    }

    const sanitizedData = {
      name: sanitizeInput(data.name),
      prompt: data.prompt, 
      category: sanitizeInput(data.category),
      systemMessage: data.systemMessage ? data.systemMessage : null,
    }

    const result = await sql`
      INSERT INTO legalprompt (name, prompt, category, "systemMessage")
      VALUES (${sanitizedData.name}, ${sanitizedData.prompt}, ${sanitizedData.category}, ${sanitizedData.systemMessage})
      RETURNING id, name, prompt, category, "systemMessage", "createdAt"
    `
    
    const newPrompt = result[0]

    revalidatePath("/")
    return { 
      success: true, 
      data: { 
        id: newPrompt.id as number,
        name: newPrompt.name as string,
        prompt: newPrompt.prompt as string,
        category: newPrompt.category as string,
        systemMessage: newPrompt.systemMessage as string | null,
        createdAt: newPrompt.createdAt as string,
        variables: extractVariables(newPrompt.prompt as string),
        usageCount: 0,
        isFavorite: false
      }
    }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Error creating prompt:", error)

    if (error.message.includes("duplicate key")) {
      return {
        success: false,
        error: {
          message: "A prompt with this name already exists.",
          code: "DUPLICATE_ERROR",
        },
      }
    }

    return {
      success: false,
      error: {
        message: "Failed to create prompt. Please try again.",
        code: "SERVER_ERROR",
      },
    }
  }
}

export async function updatePrompt(id: number, formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const content = formData.get("content") as string
    const category = formData.get("category") as string

    await sql`
      UPDATE legalprompt
      SET name = ${title}, 
          prompt = ${description}, 
          category = ${category}, 
          "systemMessage" = ${content}
      WHERE id = ${id}
    `

    revalidatePath(`/prompts/${id}`)
    revalidatePath("/")
    redirect(`/prompts/${id}`)
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Failed to update prompt:", error)
    throw new Error(`Failed to update prompt: ${error.message}`)
  }
}


export async function updateLegalPrompt(
  id: number,
  data: Partial<z.infer<typeof promptSchema>>,
): Promise<{ success: boolean; data?: LegalPrompt; error?: PromptError }> {
  try {
    const currentResults = await sql`
      SELECT id, name, prompt, category, "systemMessage", "createdAt", "updatedAt" 
      FROM legalprompt 
      WHERE id = ${id}
    `

    if (currentResults.length === 0) {
      return {
        success: false,
        error: {
          message: `Prompt with ID ${id} not found`,
          code: "NOT_FOUND",
        },
      }
    }

    const current = currentResults[0]

    const updatedData = {
      name: data.name !== undefined ? data.name : current.name as string,
      prompt: data.prompt !== undefined ? data.prompt : current.prompt as string,
      category: data.category !== undefined ? data.category : current.category as string,
      systemMessage: data.systemMessage !== undefined ? data.systemMessage : current.systemMessage as string | null,
    }

    const validationResult = promptSchema.safeParse(updatedData)

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors
      const formattedErrors: Record<string, string> = {}
      for (const key in fieldErrors) {
        const errorArray = fieldErrors[key as keyof typeof fieldErrors]
        if (errorArray && errorArray.length > 0) {
          formattedErrors[key] = errorArray[0]
        }
      }
      return {
        success: false,
        error: {
          message: "Validation failed",
          errors: formattedErrors,
          code: "VALIDATION_ERROR",
        },
      }
    }

    const sanitizedData = {
      name: sanitizeInput(updatedData.name),
      prompt: updatedData.prompt,
      category: sanitizeInput(updatedData.category),
      systemMessage: updatedData.systemMessage,
    }

    const result = await sql`
      UPDATE legalprompt
      SET name = ${sanitizedData.name},
          prompt = ${sanitizedData.prompt},
          category = ${sanitizedData.category},
          "systemMessage" = ${sanitizedData.systemMessage},
          "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING id, name, prompt, category, "systemMessage", "createdAt", "updatedAt"
    `

    console.log(`Updated prompt ${id}`, result[0])
    
    const updatedPrompt = result[0]

    revalidatePath("/")
    revalidatePath(`/prompts/${id}`)
    return { 
      success: true, 
      data: {
        id: updatedPrompt.id as number,
        name: updatedPrompt.name as string,
        prompt: updatedPrompt.prompt as string,
        category: updatedPrompt.category as string,
        systemMessage: updatedPrompt.systemMessage as string | null,
        createdAt: updatedPrompt.createdAt as string,
        updatedAt: updatedPrompt.updatedAt as string | undefined,
        variables: extractVariables(updatedPrompt.prompt as string),
        usageCount: current.usageCount || 0,
        isFavorite: current.isFavorite || false
      }
    }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error(`Error updating prompt ${id}:`, error)
    return {
      success: false,
      error: {
        message: "Failed to update prompt. Please try again.",
        code: "SERVER_ERROR",
      },
    }
  }
}

export async function deletePrompt(id: number) {
  try {
    await sql`DELETE FROM legalprompt WHERE id = ${id}`
    revalidatePath("/")
    redirect("/")
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Failed to delete prompt:", error)
    throw new Error(`Failed to delete prompt: ${error.message}`)
  }
}

/**
 * Helper function to extract variables from prompt text
 */
function extractVariables(text: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const matches = text.match(regex) || []
  return [...new Set(matches.map((match) => match.slice(2, -2)))]
}

/**
 * Duplicate an existing prompt
 */
export async function duplicateLegalPrompt(
  id: number,
): Promise<{ success: boolean; data?: LegalPrompt; error?: string }> {
  try {
    const results = await sql`
      SELECT name, prompt, category, "systemMessage", "createdAt"
      FROM legalprompt 
      WHERE id = ${id}
    `

    if (results.length === 0) {
      return {
        success: false,
        error: `Prompt with ID ${id} not found`,
      }
    }

    const originalPrompt = results[0]

    const newPromptData = {
      name: `Copy of ${originalPrompt.name as string}`,
      prompt: originalPrompt.prompt as string,
      category: originalPrompt.category as string,
      systemMessage: originalPrompt.systemMessage as string | null,
    }

    const insertResult = await sql`
      INSERT INTO legalprompt (name, prompt, category, "systemMessage")
      VALUES (${newPromptData.name}, ${newPromptData.prompt}, ${newPromptData.category}, ${newPromptData.systemMessage}) 
      RETURNING id, name, prompt, category, "systemMessage", "createdAt"
    `
    
    const newDbPrompt = insertResult[0]

    revalidatePath("/")
    return { 
      success: true, 
      data: {
        id: newDbPrompt.id as number,
        name: newDbPrompt.name as string,
        prompt: newDbPrompt.prompt as string,
        category: newDbPrompt.category as string,
        systemMessage: newDbPrompt.systemMessage as string | null,
        createdAt: newDbPrompt.createdAt as string,
        variables: extractVariables(newDbPrompt.prompt as string),
        usageCount: 0,
        isFavorite: false
      }
    }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error(`Error duplicating prompt ${id}:`, error)
    return {
      success: false,
      error: "Failed to duplicate prompt. Please try again.",
    }
  }
}


export async function deleteLegalPrompt(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`DELETE FROM legalprompt WHERE id = ${id}`
    revalidatePath("/")
    return { success: true }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error(`Error deleting prompt ${id}:`, error)
    return {
      success: false,
      error: `Failed to delete prompt: ${error.message}`,
    }
  }
}

export async function bulkDeletePrompts(ids: string[]): Promise<{ success?: string; error?: string }> {
  try {
    if (!ids || ids.length === 0) {
      return { error: "No prompts selected for deletion." }
    }

    const numericIds = ids.map((id) => Number.parseInt(id))

    for (const id of numericIds) {
      await sql`DELETE FROM legalprompt WHERE id = ${id}`
    }

    revalidatePath("/")
    return { success: `${ids.length} prompts deleted successfully.` }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Failed to delete prompts:", error)
    return { error: `Failed to delete prompts: ${error.message}` }
  }
}


export async function getCategories(): Promise<string[]> {
  try {
    const results = await sql`
      SELECT DISTINCT category FROM legalprompt ORDER BY category
    `
    return results.map((row: any) => row.category as string)
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function addCategory(name: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`
      INSERT INTO legalprompt (name, prompt, category, "systemMessage")
      VALUES ('Category Template', 'Template for category', ${name}, NULL)
    `
    return { success: true }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Error adding category:", error)
    return { success: false, error: error.message }
  }
}

export async function renameCategory(oldName: string, newName: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`
      UPDATE legalprompt
      SET category = ${newName}
      WHERE category = ${oldName}
    `
    return { success: true }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Error renaming category:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteCategory(name: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`
      UPDATE legalprompt
      SET category = 'Uncategorized'
      WHERE category = ${name}
    `
    return { success: true }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Error deleting category:", error)
    return { success: false, error: error.message }
  }
}


export async function getPromptStats(): Promise<{
  total: number
  byCategory: Record<string, number>
  recentlyCreated: number
  recentlyUpdated: number
  mostUsed: { name: string; count: number }[]
}> {
  try {
    const totalResult = await sql`SELECT COUNT(*) as count FROM legalprompt`
    const total = Number.parseInt(String(totalResult[0].count))

    const categoryResults = await sql`
      SELECT category, COUNT(*) as count 
      FROM legalprompt 
      GROUP BY category 
      ORDER BY count DESC
    `

    const byCategory: Record<string, number> = {}
    categoryResults.forEach((row: any) => {
      byCategory[row.category as string] = Number.parseInt(String(row.count))
    })

    const recentlyCreatedResult = await sql`
      SELECT COUNT(*) as count 
      FROM legalprompt 
      WHERE "createdAt" > NOW() - INTERVAL '7 days'
    `

    const recentlyCreated = Number.parseInt(String(recentlyCreatedResult[0].count))

    const recentlyUpdated = recentlyCreated

    const mostUsed = [
      { name: "Contract Review", count: 42 },
      { name: "Legal Research", count: 38 },
      { name: "Client Advice", count: 27 },
    ]

    return {
      total,
      byCategory,
      recentlyCreated,
      recentlyUpdated,
      mostUsed,
    }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Error fetching prompt statistics:", error)
    return {
      total: 0,
      byCategory: {},
      recentlyCreated: 0,
      recentlyUpdated: 0,
      mostUsed: [],
    }
  }
}

export async function getPromptTags(promptId: number): Promise<string[]> {
  // Mock implementation
  return []
}

export async function getAllTags(): Promise<string[]> {
  // Mock implementation
  return ["contract", "legal-analysis", "client-advice", "research", "litigation", "corporate"]
}

export async function createTag(tag: string): Promise<{ success: boolean; error?: string }> {
  // Mock implementation
  return { success: true }
}

export async function deleteTag(tag: string): Promise<{ success: boolean; error?: string }> {
  // Mock implementation
  return { success: true }
}

export async function getPromptVersions(promptId: number): Promise<{
  success: boolean
  versions?: any[]
  error?: string
}> {
  // Mock implementation
  return {
    success: true,
    versions: [
      // Mock data
    ],
  }
}

export async function restorePromptVersion(
  promptId: number,
  versionId: number,
): Promise<{
  success: boolean
  error?: string
}> {
  // Mock implementation
  return { success: true }
}

export async function testPrompt(content: string, variables: Record<string, string>) {
  // Mock implementation
  return {
    success: true,
    response: `This is a mock response for the prompt: "${content}" with variables: ${JSON.stringify(variables)}`,
  }
}

export async function savePromptTest(testResult: any): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  // Mock implementation
  return {
    success: true,
    data: {
      ...testResult,
      id: Math.floor(Math.random() * 1000) + 1,
    },
  }
}

export async function getPromptAnalytics(
  promptId: number,
  timeRange: string,
): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  // Mock implementation
  return {
    success: true,
    data: {
      // Mock data
    },
  }
}

