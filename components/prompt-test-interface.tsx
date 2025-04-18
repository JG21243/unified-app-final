"use client"

interface PromptTestInterfaceProps {
  prompt: {
    id: number
    name: string
    prompt: string
    systemMessage: string | null
  }
}

export function PromptTestInterface({ prompt }: PromptTestInterfaceProps) {
  return (
    <div>
      <p>This component is under development. Please use the &quot;Test Prompt&quot; tab.</p>
    </div>
  )
}

