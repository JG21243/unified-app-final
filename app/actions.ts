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
  status?: PromptStatus
  owner?: string
  lastReviewedAt?: string | null
  latestVersion?: number
  publishedVersion?: number
  variables?: string[]
  usageCount?: number
  isFavorite?: boolean
  metrics?: PromptMetrics
  versions?: PromptVersionDetails[]
}

export type PromptStatus = "draft" | "review" | "published"

export type PromptMetrics = {
  adoptionCount: number
  recentFailures: number
  lastUsedAt?: string | null
}

export type PromptVersionDetails = {
  id: number
  versionNumber: number
  prompt: string
  systemMessage: string | null
  status: PromptStatus
  createdAt: string
  createdBy: string
  diffSummary?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
}

export type PromptError = {
  message: string
  errors?: Record<string, string> // For Zod field errors, string array might be more direct from .flatten()
  code?: string
}

export async function getPrompts(filters?: {
  status?: PromptStatus
  category?: string
  owner?: string
}): Promise<{ prompts: LegalPrompt[]; error: string | null }> {
  try {
    // When the database connection isn't configured, fall back to bundled prompt data
    // Access the variable dynamically so its value is read at runtime. Next.js
    // may inline environment variables if dot notation is used.
    if (!process.env["DATABASE_URL"]) {
      console.warn("DATABASE_URL is not set. Loading fallback prompts")
      const prompts: LegalPrompt[] = buildFallbackPrompts()

      const filteredPrompts = applyPromptFilters(prompts, filters)
      console.log(`Loaded ${filteredPrompts.length} filtered fallback prompts`)
      return { prompts: filteredPrompts, error: "Database connection not configured" }
    }

    const result = await sql`
      SELECT p.id, p.name, p.prompt, p.category, p."systemMessage", p."createdAt", p."updatedAt",
             p.status, p.owner, p."lastReviewedAt", p."latestVersion", p."publishedVersion",
             COALESCE(u.adoption_count, 0) AS "adoptionCount",
             COALESCE(u.recent_failures, 0) AS "recentFailures",
             u.last_used_at AS "lastUsedAt"
      FROM legalprompt p
      LEFT JOIN (
        SELECT "promptId", 
               COUNT(*) FILTER (WHERE result = 'success') AS adoption_count,
               COUNT(*) FILTER (WHERE result = 'failure' AND "createdAt" > NOW() - INTERVAL '30 days') AS recent_failures,
               MAX("createdAt") AS last_used_at
        FROM prompt_usage_logs
        GROUP BY "promptId"
      ) u ON u."promptId" = p.id
      ORDER BY p."createdAt" DESC
    `
    const prompts: LegalPrompt[] = (result as any[]).map((p) => ({
      id: p.id as number,
      name: p.name as string,
      prompt: p.prompt as string,
      category: p.category as string,
      systemMessage: p.systemMessage as string | null,
      status: (p.status as PromptStatus) || "draft",
      owner: p.owner as string,
      lastReviewedAt: p.lastReviewedAt as string | null,
      latestVersion: Number.parseInt(p.latestVersion as string) || 1,
      publishedVersion: Number.parseInt(p.publishedVersion as string) || 0,
      createdAt: p.createdAt as string,
      updatedAt: p.updatedAt as string | undefined,
      variables: p.prompt ? extractVariables(p.prompt as string) : [],
      usageCount: p.usageCount || 0,
      isFavorite: p.isFavorite || false,
      metrics: {
        adoptionCount: Number.parseInt(p.adoptionCount as string) || 0,
        recentFailures: Number.parseInt(p.recentFailures as string) || 0,
        lastUsedAt: p.lastUsedAt as string | null,
      },
    }))

    const filteredPrompts = applyPromptFilters(prompts, filters)
    console.log(`Fetched ${filteredPrompts.length} prompts from database`)

    return { prompts: filteredPrompts, error: null }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error("Failed to fetch prompts:", error)
    const prompts: LegalPrompt[] = buildFallbackPrompts()
    console.log(`Using ${prompts.length} fallback prompts due to error`)
    return {
      prompts: applyPromptFilters(prompts, filters),
      error: `Failed to fetch prompts: ${error.message}`,
    }
  }
}

export async function getPromptById(id: number): Promise<LegalPrompt | undefined> {
  const prompt = await getLegalPromptById(id)
  return prompt ?? undefined
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
      SELECT p.id, p.name, p.prompt, p.category, p."systemMessage", p."createdAt", p."updatedAt",
             p.status, p.owner, p."lastReviewedAt", p."latestVersion", p."publishedVersion",
             COALESCE(u.adoption_count, 0) AS "adoptionCount",
             COALESCE(u.recent_failures, 0) AS "recentFailures",
             u.last_used_at AS "lastUsedAt"
      FROM legalprompt p
      LEFT JOIN (
        SELECT "promptId", 
               COUNT(*) FILTER (WHERE result = 'success') AS adoption_count,
               COUNT(*) FILTER (WHERE result = 'failure' AND "createdAt" > NOW() - INTERVAL '30 days') AS recent_failures,
               MAX("createdAt") AS last_used_at
        FROM prompt_usage_logs
        GROUP BY "promptId"
      ) u ON u."promptId" = p.id
      WHERE p.id = ${id}
    `

    if (results.length === 0) {
      return null
    }

    const p = results[0]
    const variables = p.prompt ? extractVariables(p.prompt as string) : []
    const versionsResult = await getPromptVersions(id)

    const legalPrompt: LegalPrompt = {
      id: p.id as number,
      name: p.name as string,
      prompt: p.prompt as string,
      category: p.category as string,
      systemMessage: p.systemMessage as string | null,
      status: (p.status as PromptStatus) || "draft",
      owner: p.owner as string,
      lastReviewedAt: p.lastReviewedAt as string | null,
      latestVersion: Number.parseInt(p.latestVersion as string) || 1,
      publishedVersion: Number.parseInt(p.publishedVersion as string) || 0,
      createdAt: p.createdAt as string,
      updatedAt: p.updatedAt as string | undefined,
      variables,
      usageCount: p.usageCount || 0,
      isFavorite: p.isFavorite || false,
      metrics: {
        adoptionCount: Number.parseInt(p.adoptionCount as string) || 0,
        recentFailures: Number.parseInt(p.recentFailures as string) || 0,
        lastUsedAt: p.lastUsedAt as string | null,
      },
      versions: versionsResult.versions || [],
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

    await sql`
      INSERT INTO prompt_versions ("promptId", "versionNumber", prompt, "systemMessage", status, "createdBy", "diffSummary")
      VALUES (${newPrompt.id}, 1, ${sanitizedData.prompt}, ${sanitizedData.systemMessage ?? null}, 'draft', 'system', 'Initial version')
    `

    revalidatePath("/")
    revalidatePath("/prompts")
    return {
      success: true,
      data: {
        id: newPrompt.id as number,
        name: newPrompt.name as string,
        prompt: newPrompt.prompt as string,
        category: newPrompt.category as string,
        systemMessage: newPrompt.systemMessage as string | null,
        createdAt: newPrompt.createdAt as string,
        status: "draft",
        latestVersion: 1,
        publishedVersion: 0,
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
      SELECT id, name, prompt, category, "systemMessage", "createdAt", "updatedAt", status, owner, "latestVersion", "publishedVersion", "lastReviewedAt"
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

    const nextVersion = (Number.parseInt(current.latestVersion as string) || 1) + 1

    const result = await sql`
      UPDATE legalprompt
      SET name = ${sanitizedData.name},
          prompt = ${sanitizedData.prompt},
          category = ${sanitizedData.category},
          "systemMessage" = ${sanitizedData.systemMessage},
          status = 'review',
          "latestVersion" = ${nextVersion},
          "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING id, name, prompt, category, "systemMessage", "createdAt", "updatedAt"
    `

    console.log(`Updated prompt ${id}`, result[0])

    await sql`
      INSERT INTO prompt_versions ("promptId", "versionNumber", prompt, "systemMessage", status, "createdBy", "diffSummary")
      VALUES (${id}, ${nextVersion}, ${sanitizedData.prompt}, ${sanitizedData.systemMessage ?? null}, 'review', ${current.owner ?? "system"}, 'Automated version from updateLegalPrompt')
    `

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
  versions?: PromptVersionDetails[]
  error?: string
}> {
  try {
    if (!process.env["DATABASE_URL"]) {
      return { success: true, versions: buildFallbackVersions(promptId) }
    }

    const results = await sql`
      SELECT id, "versionNumber", prompt, "systemMessage", status, "createdBy", "diffSummary", "reviewedBy", "reviewedAt", "createdAt"
      FROM prompt_versions
      WHERE "promptId" = ${promptId}
      ORDER BY "versionNumber" DESC
    `

    const versions = (results as any[]).map(mapVersionRow)

    return { success: true, versions }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error(`Error fetching prompt versions for ${promptId}:`, error)
    return { success: false, error: error.message }
  }
}

export async function createPromptVersion(
  promptId: number,
  data: {
    prompt: string
    systemMessage?: string | null
    createdBy?: string
    diffSummary?: string
    status?: PromptStatus
  },
): Promise<{ success: boolean; version?: PromptVersionDetails; error?: string }> {
  if (!process.env["DATABASE_URL"]) {
    return { success: false, error: "Database connection not configured" }
  }

  try {
    const currentRows = await sql`SELECT "latestVersion" FROM legalprompt WHERE id = ${promptId}`
    if (currentRows.length === 0) {
      return { success: false, error: `Prompt with ID ${promptId} not found` }
    }

    const nextVersion = Number.parseInt(currentRows[0].latestVersion as string) + 1
    const createdBy = data.createdBy || "system"
    const status: PromptStatus = data.status || "draft"
    const insertResult = await sql`
      INSERT INTO prompt_versions ("promptId", "versionNumber", prompt, "systemMessage", status, "createdBy", "diffSummary")
      VALUES (${promptId}, ${nextVersion}, ${data.prompt}, ${data.systemMessage ?? null}, ${status}, ${createdBy}, ${data.diffSummary ?? null})
      RETURNING id, "versionNumber", prompt, "systemMessage", status, "createdBy", "diffSummary", "reviewedBy", "reviewedAt", "createdAt"
    `

    await sql`
      UPDATE legalprompt
      SET prompt = ${data.prompt},
          "systemMessage" = ${data.systemMessage ?? null},
          status = ${status === "published" ? "review" : status},
          "latestVersion" = ${nextVersion},
          "updatedAt" = NOW()
      WHERE id = ${promptId}
    `

    revalidatePath(`/prompts/${promptId}`)
    revalidatePath("/prompts")

    return { success: true, version: mapVersionRow(insertResult[0]) }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error(`Error creating prompt version for ${promptId}:`, error)
    return { success: false, error: error.message }
  }
}

export async function publishPromptVersion(
  promptId: number,
  versionNumber: number,
  reviewer?: string,
): Promise<{ success: boolean; version?: PromptVersionDetails; error?: string }> {
  if (!process.env["DATABASE_URL"]) {
    return { success: false, error: "Database connection not configured" }
  }

  try {
    const versionRows = await sql`
      SELECT id, "versionNumber", prompt, "systemMessage", status, "createdBy", "diffSummary", "reviewedBy", "reviewedAt", "createdAt"
      FROM prompt_versions
      WHERE "promptId" = ${promptId} AND "versionNumber" = ${versionNumber}
    `

    if (versionRows.length === 0) {
      return { success: false, error: `Version ${versionNumber} not found for prompt ${promptId}` }
    }

    const versionRow = versionRows[0]

    await sql`
      UPDATE legalprompt
      SET prompt = ${versionRow.prompt},
          "systemMessage" = ${versionRow.systemMessage ?? null},
          status = 'published',
          "publishedVersion" = ${versionNumber},
          "latestVersion" = GREATEST("latestVersion", ${versionNumber}),
          "lastReviewedAt" = NOW(),
          "updatedAt" = NOW()
      WHERE id = ${promptId}
    `

    const reviewedAt = new Date().toISOString()

    await sql`
      UPDATE prompt_versions
      SET status = 'published',
          "reviewedBy" = ${reviewer ?? "reviewer"},
          "reviewedAt" = ${reviewedAt}
      WHERE id = ${versionRow.id}
    `

    revalidatePath(`/prompts/${promptId}`)
    revalidatePath("/prompts")

    const publishedVersion = {
      ...versionRow,
      status: "published",
      reviewedBy: reviewer ?? "reviewer",
      reviewedAt,
    }

    return { success: true, version: mapVersionRow(publishedVersion) }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error(`Error publishing version ${versionNumber} for prompt ${promptId}:`, error)
    return { success: false, error: error.message }
  }
}

export async function restorePromptVersion(
  promptId: number,
  versionNumber: number,
): Promise<{
  success: boolean
  error?: string
}> {
  if (!process.env["DATABASE_URL"]) {
    return { success: false, error: "Database connection not configured" }
  }

  try {
    const versionRows = await sql`
      SELECT id, prompt, "systemMessage", "versionNumber"
      FROM prompt_versions
      WHERE "promptId" = ${promptId} AND "versionNumber" = ${versionNumber}
    `

    if (versionRows.length === 0) {
      return { success: false, error: `Version ${versionNumber} not found for prompt ${promptId}` }
    }

    const versionRow = versionRows[0]

    await sql`
      UPDATE legalprompt
      SET prompt = ${versionRow.prompt},
          "systemMessage" = ${versionRow.systemMessage ?? null},
          status = 'review',
          "publishedVersion" = ${versionRow.versionNumber},
          "updatedAt" = NOW()
      WHERE id = ${promptId}
    `

    revalidatePath(`/prompts/${promptId}`)
    revalidatePath("/prompts")

    return { success: true }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e))
    console.error(`Error restoring version ${versionNumber} for prompt ${promptId}:`, error)
    return { success: false, error: error.message }
  }
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

function applyPromptFilters(
  prompts: LegalPrompt[],
  filters?: { status?: PromptStatus; category?: string; owner?: string },
): LegalPrompt[] {
  if (!filters) return prompts

  return prompts.filter((prompt) => {
    const statusMatch = filters.status ? prompt.status === filters.status : true
    const categoryMatch = filters.category ? prompt.category === filters.category : true
    const ownerMatch = filters.owner ? prompt.owner === filters.owner : true
    return statusMatch && categoryMatch && ownerMatch
  })
}

function buildFallbackVersions(promptId: number): PromptVersionDetails[] {
  return [
    {
      id: promptId * 1000 + 1,
      versionNumber: 2,
      prompt: "Updated draft prompt body for offline mode",
      systemMessage: null,
      status: "review",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      createdBy: "offline-tester",
      diffSummary: "Adjusted clarity and added constraints",
      reviewedBy: null,
      reviewedAt: null,
    },
    {
      id: promptId * 1000,
      versionNumber: 1,
      prompt: "Initial version of the prompt (offline fallback)",
      systemMessage: null,
      status: "published",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      createdBy: "system",
      diffSummary: "Baseline version",
      reviewedBy: "qa@example.com",
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    },
  ]
}

function buildFallbackPrompts(): LegalPrompt[] {
  return (fallbackPrompts as any[]).map((p, i) => {
    const versions = buildFallbackVersions(i + 1)
    return {
      id: i + 1,
      name: p.title,
      prompt: p.prompt,
      category: p.category,
      systemMessage: null,
      status: "review",
      owner: "unassigned",
      lastReviewedAt: versions[0]?.reviewedAt ?? null,
      latestVersion: versions[0]?.versionNumber ?? 1,
      publishedVersion: versions.find((v) => v.status === "published")?.versionNumber ?? 0,
      createdAt: new Date().toISOString(),
      variables: [],
      usageCount: 0,
      isFavorite: false,
      metrics: {
        adoptionCount: 5 + i,
        recentFailures: i % 2,
        lastUsedAt: new Date(Date.now() - 1000 * 60 * 60 * (i + 1)).toISOString(),
      },
      versions,
    }
  })
}

function mapVersionRow(row: any): PromptVersionDetails {
  return {
    id: row.id as number,
    versionNumber: Number.parseInt(row.versionNumber as string) || 1,
    prompt: row.prompt as string,
    systemMessage: row.systemMessage as string | null,
    status: (row.status as PromptStatus) || "draft",
    createdAt: row.createdAt as string,
    createdBy: row.createdBy as string,
    diffSummary: row.diffSummary as string | null,
    reviewedBy: row.reviewedBy as string | null,
    reviewedAt: row.reviewedAt as string | null,
  }
}

