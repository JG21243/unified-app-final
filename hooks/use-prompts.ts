import { useEffect, useState } from "react"
import type { LegalPrompt } from "@/app/actions"

export function usePrompts() {
  const [prompts, setPrompts] = useState<LegalPrompt[]>([])

  useEffect(() => {
    fetch("/api/prompts")
      .then(res => res.json())
      .then((data: { prompts: LegalPrompt[] }) => {
        console.log(`usePrompts loaded ${data.prompts.length} prompts`)
        setPrompts(data.prompts)
      })
      .catch(err => {
        console.error("Failed to load prompts", err)
      })
  }, [])

  return { prompts }
}
