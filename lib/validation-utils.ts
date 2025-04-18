import { z } from "zod"
import DOMPurify from "isomorphic-dompurify"

// Define the schema for prompt validation
export const promptSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  prompt: z
    .string()
    .min(10, { message: "Prompt must be at least 10 characters" })
    .max(10000, { message: "Prompt must be less than 10000 characters" }),
  category: z
    .string()
    .min(1, { message: "Category is required" })
    .max(50, { message: "Category must be less than 50 characters" }),
  systemMessage: z.string().optional(),
})

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input)
}

// Validate email format
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Extract variables from prompt text
export function extractVariables(text: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const matches = text.match(regex) || []
  return [...new Set(matches.map((match) => match.slice(2, -2)))]
}

// Validate that all required variables are provided
export function validateVariables(
  promptText: string,
  variables: Record<string, string>,
): { isValid: boolean; missingVariables: string[] } {
  const requiredVariables = extractVariables(promptText)
  const providedVariables = Object.keys(variables)

  const missingVariables = requiredVariables.filter(
    (variable) => !providedVariables.includes(variable) || !variables[variable],
  )

  return {
    isValid: missingVariables.length === 0,
    missingVariables,
  }
}

