import ChatPageClient from "./ChatPageClient"
import { getLegalPromptById } from "@/app/actions"

interface ChatPageProps {
  searchParams?: {
    promptId?: string
  }
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const id = Number.parseInt(searchParams?.promptId ?? "")
  let promptText: string | undefined
  if (!isNaN(id)) {
    const prompt = await getLegalPromptById(id)
    if (prompt) {
      promptText = prompt.prompt
    }
  }
  return <ChatPageClient initialPrompt={promptText} />
}
