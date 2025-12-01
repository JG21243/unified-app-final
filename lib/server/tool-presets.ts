import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { toolPresets, type ToolPreset } from "@/lib/db/schema";
import {
  toolPresetSchema,
  toolPresetUpdateSchema,
  type ToolPresetPayload,
  type ToolPresetUpdate,
} from "@/lib/validations/tools-preset";

export type ToolPresetWithOwner = ToolPresetPayload & {
  id: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string | null;
};

const USER_COOKIE_KEY = "tools-user-id";
const PRESET_COOKIE_KEY = "tools-presets";

export function getOrCreateUserId() {
  const cookieStore = cookies();
  let userId = cookieStore.get(USER_COOKIE_KEY)?.value;

  if (!userId) {
    userId = randomUUID();
    cookieStore.set(USER_COOKIE_KEY, userId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
    });
  }

  return userId;
}

function mapRecordToPreset(record: ToolPreset & { userId: string }): ToolPresetWithOwner {
  return {
    id: record.id,
    name: record.name,
    fileSearchEnabled: record.fileSearchEnabled,
    webSearchEnabled: record.webSearchEnabled,
    functionsEnabled: record.functionsEnabled,
    vectorStore: record.vectorStore,
    webSearchConfig: record.webSearchConfig ?? { user_location: { type: "approximate", country: "", region: "", city: "" } },
    isPublic: record.isPublic,
    workspaceId: record.workspaceId,
    ownerId: record.userId,
    createdAt: record.createdAt?.toISOString?.() ?? String(record.createdAt),
    updatedAt: record.updatedAt?.toISOString?.() ?? String(record.updatedAt),
    lastUsedAt: record.lastUsedAt?.toISOString?.() ?? record.lastUsedAt,
  };
}

function readCookiePresets(): ToolPresetWithOwner[] {
  const raw = cookies().get(PRESET_COOKIE_KEY)?.value;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ToolPresetWithOwner[];
    return parsed;
  } catch (error) {
    console.error("Failed to parse preset cookie", error);
    return [];
  }
}

function writeCookiePresets(presets: ToolPresetWithOwner[]) {
  cookies().set(PRESET_COOKIE_KEY, JSON.stringify(presets), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
  });
}

export async function listPresetsForUser(userId: string): Promise<ToolPresetWithOwner[]> {
  if (db) {
    const records = await db
      .select()
      .from(toolPresets)
      .where(eq(toolPresets.userId, userId))
      .orderBy(desc(toolPresets.lastUsedAt), desc(toolPresets.updatedAt));

    return records.map((record) => mapRecordToPreset({ ...record, userId }));
  }

  return readCookiePresets()
    .filter((preset) => preset.ownerId === userId)
    .sort((a, b) => {
      const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
      const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
      return bTime - aTime;
    });
}

export async function createPresetForUser(
  userId: string,
  payload: ToolPresetPayload,
): Promise<ToolPresetWithOwner> {
  const data = toolPresetSchema.parse(payload);
  const now = new Date();

  if (db) {
    const [record] = await db
      .insert(toolPresets)
      .values({
        ...data,
        userId,
        createdAt: now,
        updatedAt: now,
        lastUsedAt: now,
      })
      .returning();

    return mapRecordToPreset({ ...record, userId });
  }

  const newPreset: ToolPresetWithOwner = {
    ...data,
    id: randomUUID(),
    ownerId: userId,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
  };

  const existing = readCookiePresets().filter((preset) => preset.ownerId === userId);
  writeCookiePresets([...existing, newPreset]);
  return newPreset;
}

export async function updatePresetForUser(
  userId: string,
  id: string,
  payload: ToolPresetUpdate,
): Promise<ToolPresetWithOwner | null> {
  const data = toolPresetUpdateSchema.parse(payload);
  const now = new Date();

  if (db) {
    const [record] = await db
      .update(toolPresets)
      .set({ ...data, updatedAt: now })
      .where(and(eq(toolPresets.id, id), eq(toolPresets.userId, userId)))
      .returning();

    return record ? mapRecordToPreset({ ...record, userId }) : null;
  }

  const presets = readCookiePresets();
  const index = presets.findIndex((preset) => preset.id === id && preset.ownerId === userId);
  if (index === -1) return null;

  const updated: ToolPresetWithOwner = {
    ...presets[index],
    ...data,
    updatedAt: now.toISOString(),
  };
  presets[index] = updated;
  writeCookiePresets(presets);
  return updated;
}

export async function deletePresetForUser(userId: string, id: string): Promise<boolean> {
  if (db) {
    const [record] = await db
      .delete(toolPresets)
      .where(and(eq(toolPresets.id, id), eq(toolPresets.userId, userId)))
      .returning();

    return Boolean(record);
  }

  const presets = readCookiePresets();
  const remaining = presets.filter((preset) => !(preset.id === id && preset.ownerId === userId));
  writeCookiePresets(remaining);
  return presets.length !== remaining.length;
}

export async function markPresetAsUsed(userId: string, id: string): Promise<void> {
  const now = new Date();

  if (db) {
    await db
      .update(toolPresets)
      .set({ lastUsedAt: now, updatedAt: now })
      .where(and(eq(toolPresets.id, id), eq(toolPresets.userId, userId)));
    return;
  }

  const presets = readCookiePresets();
  const index = presets.findIndex((preset) => preset.id === id && preset.ownerId === userId);
  if (index !== -1) {
    presets[index].lastUsedAt = now.toISOString();
    presets[index].updatedAt = now.toISOString();
    writeCookiePresets(presets);
  }
}

export async function getPresetById(id: string): Promise<ToolPresetWithOwner | null> {
  if (db) {
    const [record] = await db.select().from(toolPresets).where(eq(toolPresets.id, id));
    if (!record) return null;
    return mapRecordToPreset({ ...record, userId: record.userId });
  }

  const preset = readCookiePresets().find((entry) => entry.id === id);
  return preset ?? null;
}
