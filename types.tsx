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
}

