"use server"

import { NextResponse } from "next/server"
import { getPrompts } from "@/app/actions"

export async function GET() {
  const result = await getPrompts()
  return NextResponse.json(result)
}
