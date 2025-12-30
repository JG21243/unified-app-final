import {
  boolean,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { type ToolPresetPayload, type WebSearchConfig } from "@/lib/validations/tools-preset"

// Define the table with the correct name "legalprompt"
export const prompts = pgTable("legalprompt", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  prompt: text("prompt").notNull(),
  category: varchar("category", { length: 100 }),
  systemMessage: text("systemMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})

export type Prompt = typeof prompts.$inferSelect
export type NewPrompt = typeof prompts.$inferInsert

export const toolPresets = pgTable("tool_presets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  fileSearchEnabled: boolean("file_search_enabled").notNull().default(false),
  webSearchEnabled: boolean("web_search_enabled").notNull().default(false),
  functionsEnabled: boolean("functions_enabled").notNull().default(true),
  vectorStore: jsonb("vector_store").$type<ToolPresetPayload["vectorStore"]>().default(null),
  webSearchConfig: jsonb("web_search_config").$type<WebSearchConfig>().default({}),
  isPublic: boolean("is_public").notNull().default(false),
  workspaceId: varchar("workspace_id", { length: 255 }),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type ToolPreset = typeof toolPresets.$inferSelect
export type NewToolPreset = typeof toolPresets.$inferInsert

