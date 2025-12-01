"use server"

import { NextResponse } from "next/server"
import type { PromptStatus } from "@/app/actions"
import { getPrompts } from "@/app/actions"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = (searchParams.get("status") as PromptStatus | null) || undefined
  const category = searchParams.get("category") || undefined
  const owner = searchParams.get("owner") || undefined

  const result = await getPrompts({ status, category, owner })
  return NextResponse.json(result)
}
