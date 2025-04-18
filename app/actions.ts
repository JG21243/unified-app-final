"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { z } from "zod"

import { sql } from "@/lib/db"
import { promptSchema } from "@/lib/validations/prompt"
import { sanitizeInput } from "@/lib/validation-utils"

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
  errors?: Record<string, string>
  code?: string
}

export async function getPrompts() {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is not set")
      return {
        prompts: [],
        error: "Database connection not configured. Please check your environment variables.",
      }
    }

    // Use the tagged template syntax for the Neon client
    const result = await sql`
      SELECT * FROM legalprompt 
      ORDER BY "createdAt" DESC
    `

    return { prompts: result, error: null }
  } catch (error) {
    console.error("Failed to fetch prompts:", error)
    return {
      prompts: [],
      error: `Failed to fetch prompts: ${error.message}. Please check your database connection.`,
    }
  }
}

export async function getPromptById(id: number) {
  try {
    const result = await sql`
      SELECT * FROM legalprompt
      WHERE id = ${id}
    `
    return result[0]
  } catch (error) {
    console.error("Failed to fetch prompt:", error)
    throw new Error("Failed to fetch prompt")
  }
}

/**
 * Get all prompts with enhanced filtering, pagination, and error handling
 */
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
    // Set default limit to avoid retrieving too much data
    const limit = options?.limit || 10
    const offset = options?.offset || 0

    // This is a simplified implementation - in a real app, you would build
    // the query dynamically based on the options
    const result = await sql`
      SELECT * FROM legalprompt
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Get total count
    const countResult = await sql`SELECT COUNT(*) as total FROM legalprompt`
    const total = Number.parseInt(countResult[0].total)

    return { prompts: result, total }
  } catch (error) {
    console.error("Error fetching prompts:", error)
    // Return empty results instead of throwing to prevent page errors
    return { prompts: [], total: 0 }
  }
}

/**
 * Get a single prompt by ID with enhanced error handling
 */
export async function getLegalPromptById(id: number): Promise<LegalPrompt | null> {
  try {
    const results = await sql`
      SELECT id, name, prompt, category, "systemMessage", "createdAt"
      FROM legalprompt 
      WHERE id = ${id}
    `

    if (results.length === 0) {
      return null
    }

    // Extract variables from the prompt
    const prompt = results[0]
    const variables = extractVariables(prompt.prompt)

    // Instead of querying the non-existent prompt_usage table,
    // we'll return a default value for usageCount
    return {
      ...prompt,
      variables,
      usageCount: 0, // Default value since the table doesn't exist
    }
  } catch (error) {
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

    // Create a new Date object for the current time
    const createdAt = new Date().toISOString()

    await sql`
      INSERT INTO legalprompt (name, prompt, category, "systemMessage", "createdAt")
      VALUES (${title}, ${description}, ${category}, ${content}, ${createdAt})
    `

    revalidatePath("/")
    redirect("/")
  } catch (error) {
    console.error("Failed to create prompt:", error)
    throw new Error("Failed to create prompt")
  }
}

/**
 * Create a new prompt with enhanced validation
 */
export async function createLegalPrompt(
  data: z.infer<typeof promptSchema>,
): Promise<{ success: boolean; data?: LegalPrompt; error?: PromptError }> {
  try {
    // Validate the input data using Zod
    const validationResult = promptSchema.safeParse(data)

    if (!validationResult.success) {
      return {
        success: false,
        error: {
          message: "Validation failed",
          errors: validationResult.error.format(),
          code: "VALIDATION_ERROR",
        },
      }
    }

    // Sanitize inputs to prevent XSS
    const sanitizedData = {
      name: sanitizeInput(data.name),
      prompt: data.prompt, // Don't sanitize prompt as it may contain intentional special characters
      category: sanitizeInput(data.category),
      systemMessage: data.systemMessage ? data.systemMessage : null,
    }

    // Insert the new prompt
    const result = await sql`
      INSERT INTO legalprompt (name, prompt, category, "systemMessage")
      VALUES (${sanitizedData.name}, ${sanitizedData.prompt}, ${sanitizedData.category}, ${sanitizedData.systemMessage})
      RETURNING id, name, prompt, category, "systemMessage", "createdAt"
    `

    revalidatePath("/")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Error creating prompt:", error)

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("duplicate key")) {
        return {
          success: false,
          error: {
            message: "A prompt with this name already exists.",
            code: "DUPLICATE_ERROR",
          },
        }
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
  } catch (error) {
    console.error("Failed to update prompt:", error)
    throw new Error("Failed to update prompt")
  }
}

/**
 * Update an existing prompt with enhanced validation and error handling
 */
export async function updateLegalPrompt(
  id: number,
  data: Partial<z.infer<typeof promptSchema>>,
): Promise<{ success: boolean; data?: LegalPrompt; error?: PromptError }> {
  try {
    // Get the current data to merge with updates
    const currentResults = await sql`
      SELECT id, name, prompt, category, "systemMessage" 
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

    // Merge the existing data with the updates
    const updatedData = {
      name: data.name !== undefined ? data.name : current.name,
      prompt: data.prompt !== undefined ? data.prompt : current.prompt,
      category: data.category !== undefined ? data.category : current.category,
      systemMessage: data.systemMessage !== undefined ? data.systemMessage : current.systemMessage,
    }

    // Validate the merged data
    const validationResult = promptSchema.safeParse(updatedData)

    if (!validationResult.success) {
      return {
        success: false,
        error: {
          message: "Validation failed",
          errors: validationResult.error.format(),
          code: "VALIDATION_ERROR",
        },
      }
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(updatedData.name),
      prompt: updatedData.prompt,
      category: sanitizeInput(updatedData.category),
      systemMessage: updatedData.systemMessage,
    }

    // Update the prompt
    const result = await sql`
      UPDATE legalprompt 
      SET name = ${sanitizedData.name}, 
          prompt = ${sanitizedData.prompt}, 
          category = ${sanitizedData.category}, 
          "systemMessage" = ${sanitizedData.systemMessage}
      WHERE id = ${id} 
      RETURNING id, name, prompt, category, "systemMessage", "createdAt"
    `

    revalidatePath("/")
    revalidatePath(`/prompts/${id}`)
    return { success: true, data: result[0] }
  } catch (error) {
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
  } catch (error) {
    console.error("Failed to delete prompt:", error)
    throw new Error("Failed to delete prompt")
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
    // First, get the prompt to duplicate
    const results = await sql`
      SELECT name, prompt, category, "systemMessage"
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

    // Create a copy with "Copy of" prefix
    const newPrompt = {
      name: `Copy of ${originalPrompt.name}`,
      prompt: originalPrompt.prompt,
      category: originalPrompt.category,
      systemMessage: originalPrompt.systemMessage,
    }

    // Insert the new prompt
    const insertResult = await sql`
      INSERT INTO legalprompt (name, prompt, category, "systemMessage")
      VALUES (${newPrompt.name}, ${newPrompt.prompt}, ${newPrompt.category}, ${newPrompt.systemMessage}) 
      RETURNING id, name, prompt, category, "systemMessage", "createdAt"
    `

    revalidatePath("/")
    return { success: true, data: insertResult[0] }
  } catch (error) {
    console.error(`Error duplicating prompt ${id}:`, error)
    return {
      success: false,
      error: "Failed to duplicate prompt. Please try again.",
    }
  }
}

/**
 * Delete a prompt
 */
export async function deleteLegalPrompt(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`DELETE FROM legalprompt WHERE id = ${id}`
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error(`Error deleting prompt ${id}:`, error)
    return {
      success: false,
      error: "Failed to delete prompt. Please try again.",
    }
  }
}

export async function bulkDeletePrompts(ids: string[]) {
  try {
    if (!ids || ids.length === 0) {
      return { error: "No prompts selected for deletion." }
    }

    const numericIds = ids.map((id) => Number.parseInt(id))

    // This is a simplified approach - in a real app, you would use a more efficient method
    for (const id of numericIds) {
      await sql`DELETE FROM legalprompt WHERE id = ${id}`
    }

    revalidatePath("/")
    return { success: `${ids.length} prompts deleted successfully.` }
  } catch (error) {
    console.error("Failed to delete prompts:", error)
    return { error: "Failed to delete prompts." }
  }
}

/**
 * Get all unique categories
 */
export async function getCategories(): Promise<string[]> {
  try {
    const results = await sql`
      SELECT DISTINCT category FROM legalprompt ORDER BY category
    `
    return results.map((row) => row.category)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

/**
 * Get prompt statistics
 */
export async function getPromptStats(): Promise<{
  total: number
  byCategory: Record<string, number>
  recentlyCreated: number
  recentlyUpdated: number
  mostUsed: { name: string; count: number }[]
}> {
  try {
    // Get total count
    const totalResult = await sql`SELECT COUNT(*) as count FROM legalprompt`
    const total = Number.parseInt(totalResult[0].count)

    // Get count by category
    const categoryResults = await sql`
      SELECT category, COUNT(*) as count 
      FROM legalprompt 
      GROUP BY category 
      ORDER BY count DESC
    `

    const byCategory: Record<string, number> = {}
    categoryResults.forEach((row) => {
      byCategory[row.category] = Number.parseInt(row.count)
    })

    // Get recently created count (last 7 days)
    const recentlyCreatedResult = await sql`
      SELECT COUNT(*) as count 
      FROM legalprompt 
      WHERE "createdAt" > NOW() - INTERVAL '7 days'
    `

    const recentlyCreated = Number.parseInt(recentlyCreatedResult[0].count)

    // Since updatedAt doesn't exist, use createdAt as a fallback
    const recentlyUpdated = recentlyCreated

    // Mock most used prompts since we don't have the prompt_usage table
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
  } catch (error) {
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

