import { NextResponse } from "next/server"

import type { PromptStatus } from "@/app/actions"
import { createPromptVersion } from "@/app/actions"

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const promptId = Number.parseInt(params.id)
  if (Number.isNaN(promptId)) {
    return NextResponse.json({ error: "Invalid prompt id" }, { status: 400 })
  }

  const body = await request.json()
  const result = await createPromptVersion(promptId, {
    prompt: body.prompt,
    systemMessage: body.systemMessage,
    createdBy: body.createdBy,
    diffSummary: body.diffSummary,
    status: body.status as PromptStatus | undefined,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ version: result.version })
}
