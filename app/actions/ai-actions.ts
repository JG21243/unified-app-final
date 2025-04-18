"use server"

import { OpenAI } from "openai"

// Create an OpenAI API client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function testPrompt(
  prompt: string,
  systemMessage?: string | null,
  variableValues?: Record<string, string>,
) {
  try {
    // Replace variables in the prompt if provided
    let processedPrompt = prompt
    if (variableValues) {
      for (const [variable, value] of Object.entries(variableValues)) {
        processedPrompt = processedPrompt.replace(new RegExp(`\\{\\{\\s*${variable}\\s*\\}\\}`, "g"), value)
      }
    }

    // Create the messages array
    const messages = []

    if (systemMessage) {
      messages.push({
        role: "system",
        content: systemMessage,
      })
    }

    messages.push({
      role: "user",
      content: processedPrompt,
    })

    // Generate a response
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    })

    return {
      success: true,
      response: response.choices[0].message.content,
    }
  } catch (error: any) {
    console.error("Error in testPrompt:", error)
    return {
      success: false,
      error: error.message || "An error occurred",
    }
  }
}

