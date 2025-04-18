import type { NextRequest } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"

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
    const { prompt, systemMessage } = promptData

    // Validate the request
    if (!prompt) {
      return new Response(JSON.stringify({ message: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
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
      content: prompt,
    })

    // Create a new OpenAI instance
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Use a non-streaming approach for simplicity
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      stream: false, // Set to false to get a regular response
    })

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
    return new Response(
      JSON.stringify({
        message: error.message || "An unexpected server error occurred",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

