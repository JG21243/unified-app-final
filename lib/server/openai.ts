import "server-only"
import OpenAI from "openai"

// Create an OpenAI API client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateAIResponse(
  prompt: string,
  systemMessage: string | null,
): Promise<{
  success: boolean
  response?: string
  responseTime?: number
  error?: string
}> {
  try {
    const startTime = Date.now()

    // Create the messages array with system message if provided
    const messages = []
    if (systemMessage) {
      messages.push({
        role: "system",
        content: systemMessage,
      })
    }

    messages.push({
      role: "user",
      content: prompt,
    })

    // Request the OpenAI API for the response
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const endTime = Date.now()
    const responseTime = endTime - startTime

    return {
      success: true,
      response: response.choices[0]?.message?.content || "",
      responseTime,
    }
  } catch (error) {
    console.error("Error generating AI response:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate AI response",
    }
  }
}

