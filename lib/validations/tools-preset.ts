import { z } from "zod";

export const vectorStoreConfigSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().optional(),
    config: z.record(z.unknown()).optional(),
  })
  .nullable();

export const webSearchConfigSchema = z.object({
  user_location: z
    .object({
      type: z.literal("approximate"),
      country: z.string().optional().default(""),
      region: z.string().optional().default(""),
      city: z.string().optional().default(""),
    })
    .optional()
    .default({ type: "approximate", country: "", region: "", city: "" }),
});

export const toolPresetSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Preset name is required"),
  fileSearchEnabled: z.boolean(),
  webSearchEnabled: z.boolean(),
  functionsEnabled: z.boolean(),
  vectorStore: vectorStoreConfigSchema,
  webSearchConfig: webSearchConfigSchema,
  isPublic: z.boolean().optional().default(false),
  workspaceId: z.string().optional().nullable(),
});

export const toolPresetUpdateSchema = toolPresetSchema.omit({ id: true }).partial();

export type ToolPresetPayload = z.infer<typeof toolPresetSchema>;
export type ToolPresetUpdate = z.infer<typeof toolPresetUpdateSchema>;
export type WebSearchConfig = z.infer<typeof webSearchConfigSchema>;
