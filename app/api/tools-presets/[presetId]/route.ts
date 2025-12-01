import { NextResponse } from "next/server";

import {
  deletePresetForUser,
  getOrCreateUserId,
  getPresetById,
  markPresetAsUsed,
  updatePresetForUser,
} from "@/lib/server/tool-presets";
import { toolPresetUpdateSchema } from "@/lib/validations/tools-preset";

interface RouteParams {
  params: { presetId: string };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const userId = getOrCreateUserId();
  const preset = await getPresetById(params.presetId);

  if (!preset) {
    return NextResponse.json({ message: "Preset not found" }, { status: 404 });
  }

  if (!preset.isPublic && preset.ownerId !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ preset });
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const userId = getOrCreateUserId();
    const payload = toolPresetUpdateSchema.parse(await request.json());
    const existing = await getPresetById(params.presetId);

    if (!existing) {
      return NextResponse.json({ message: "Preset not found" }, { status: 404 });
    }

    if (existing.ownerId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updated = await updatePresetForUser(userId, params.presetId, payload);
    if (!updated) {
      return NextResponse.json({ message: "Preset not found" }, { status: 404 });
    }

    return NextResponse.json({ preset: updated });
  } catch (error) {
    console.error("Failed to update preset", error);
    return NextResponse.json({ message: "Unable to update preset" }, { status: 400 });
  }
}

export async function POST(_request: Request, { params }: RouteParams) {
  const userId = getOrCreateUserId();
  const preset = await getPresetById(params.presetId);

  if (!preset) {
    return NextResponse.json({ message: "Preset not found" }, { status: 404 });
  }

  if (preset.ownerId !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await markPresetAsUsed(userId, params.presetId);
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const userId = getOrCreateUserId();
  const preset = await getPresetById(params.presetId);

  if (!preset) {
    return NextResponse.json({ message: "Preset not found" }, { status: 404 });
  }

  if (preset.ownerId !== userId) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await deletePresetForUser(userId, params.presetId);
  return NextResponse.json({ success: true });
}
