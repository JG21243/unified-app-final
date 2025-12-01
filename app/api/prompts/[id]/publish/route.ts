import { NextResponse } from "next/server"

import { publishPromptVersion } from "@/app/actions"

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const promptId = Number.parseInt(params.id)
  if (Number.isNaN(promptId)) {
    return NextResponse.json({ error: "Invalid prompt id" }, { status: 400 })
  }

  const body = await request.json()
  const versionNumber = Number.parseInt(body.versionNumber)

  if (Number.isNaN(versionNumber)) {
    return NextResponse.json({ error: "Invalid version number" }, { status: 400 })
  }

  const result = await publishPromptVersion(promptId, versionNumber, body.reviewer)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ version: result.version })
}
