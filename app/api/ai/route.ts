import type { NextRequest } from "next/server"
import OpenAI from "openai"

import { incrementPromptUsage } from "@/app/actions"

export const runtime = "nodejs"

/**
 * Handles POST requests to the /api/ai endpoint.
 *
 * This function:
 *   1. Verifies that the OPENAI_API_KEY environment variable is set.
 *   2. Parses and validates the request body for `prompt` and optional `systemMessage`.
 *   3. Constructs the chat messages array for the OpenAI API.
 *   4. Invokes the OpenAI Chat Completion API with the specified model.
 *   5. Returns the AI-generated response or an error message in JSON format.
 *
 * @param req - The NextRequest containing a JSON payload with:
 *                 - `prompt`: The user input to send to the AI model (required).
 *                 - `systemMessage`: An optional system-level instruction for the AI.
 * @returns A Promise that resolves to a Response with:
 *            - On success: status 200 and JSON `{ response: string }`.
 *            - On client error: status 400 and JSON `{ message: string }`.
 *            - On server error: status 500 and JSON `{ message: string }`.
 */
export async function POST(req: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          message: "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    // Parse the request body
    const promptData = await req.json()
    const { prompt, systemMessage, promptId } = promptData

    // Validate the request
    if (!prompt) {
      return new Response(JSON.stringify({ message: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create the messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

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

    // Create a new OpenAI instance
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Use a non-streaming approach for simplicity
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      stream: false, // Set to false to get a regular response
    })

    if (promptId) {
      void incrementPromptUsage(Number.parseInt(String(promptId)))
    }

    // Return the response
    return new Response(
      JSON.stringify({
        response: completion.choices[0]?.message?.content || "",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error in AI API route:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred"
    return new Response(
      JSON.stringify({
        message: errorMessage,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

