export type PromptRow = Record<string, unknown>

export function isMissingColumnError(error: unknown, column: string): boolean {
  if (!error || typeof error !== "object") {
    return false
  }
  const err = error as { code?: string; message?: string }
  if (err.code === "42703") {
    return true
  }
  return Boolean(err.message?.includes(`column "${column}" does not exist`))
}

export function isMissingPromptMetadataColumns(error: unknown): boolean {
  return isMissingColumnError(error, "usageCount") || isMissingColumnError(error, "isFavorite")
}

export async function runPromptQuery<T>(options: {
  primary: () => Promise<T>
  fallback: () => Promise<T>
  ensureColumns?: () => Promise<void>
}): Promise<T> {
  try {
    return await options.primary()
  } catch (error) {
    if (isMissingPromptMetadataColumns(error)) {
      console.warn("Prompt metadata columns missing; attempting to add them.")
      try {
        await options.ensureColumns?.()
      } catch (ensureError) {
        console.warn("Unable to ensure prompt metadata columns:", ensureError)
      }
      try {
        return await options.primary()
      } catch (retryError) {
        if (isMissingPromptMetadataColumns(retryError)) {
          console.warn("Prompt metadata columns still missing; falling back to base query.")
          return await options.fallback()
        }
        throw retryError
      }
    }
    throw error
  }
}

export function normalizePromptRow(row: PromptRow): { usageCount: number; isFavorite: boolean } {
  return {
    usageCount: Number(row.usageCount ?? 0),
    isFavorite: Boolean(row.isFavorite ?? false),
  }
}
