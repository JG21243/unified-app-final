import { NextResponse } from "next/server";

import {
  createPresetForUser,
  getOrCreateUserId,
  listPresetsForUser,
} from "@/lib/server/tool-presets";
import { toolPresetSchema } from "@/lib/validations/tools-preset";

export async function GET() {
  const userId = getOrCreateUserId();
  const presets = await listPresetsForUser(userId);

  return NextResponse.json({ presets });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = toolPresetSchema.parse(body);
    const userId = getOrCreateUserId();
    const preset = await createPresetForUser(userId, data);

    return NextResponse.json({ preset }, { status: 201 });
  } catch (error) {
    console.error("Failed to create preset", error);
    return NextResponse.json({ message: "Unable to save preset" }, { status: 400 });
  }
}
