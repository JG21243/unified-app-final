import { useEffect, useState } from "react"
import { getPrompts, type LegalPrompt } from "@/app/actions"

export function usePrompts() {
  const [prompts, setPrompts] = useState<LegalPrompt[]>([])

  useEffect(() => {
    getPrompts().then(({ prompts }) => {
      console.log(`usePrompts loaded ${prompts.length} prompts`)
      setPrompts(prompts)
    })
  }, [])

  return { prompts }
}
