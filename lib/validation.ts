export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validatePrompt(data: {
  name?: string
  prompt?: string
  category?: string
  systemMessage?: string | null
}): ValidationResult {
  const errors: Record<string, string> = {}

  // Name validation
  if (!data.name?.trim()) {
    errors.name = "Name is required"
  } else if (data.name.length > 100) {
    errors.name = "Name must be less than 100 characters"
  }

  // Prompt validation
  if (!data.prompt?.trim()) {
    errors.prompt = "Prompt text is required"
  } else if (data.prompt.length > 10000) {
    errors.prompt = "Prompt must be less than 10,000 characters"
  }

  // Category validation
  if (!data.category?.trim()) {
    errors.category = "Category is required"
  } else if (data.category.length > 50) {
    errors.category = "Category must be less than 50 characters"
  }

  // System message validation (optional)
  if (data.systemMessage && data.systemMessage.length > 5000) {
    errors.systemMessage = "System message must be less than 5,000 characters"
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

