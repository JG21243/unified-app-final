import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

export const promptStatusEnum = pgEnum("prompt_status", ["draft", "review", "published"])

// Define the table with the correct name "legalprompt"
export const prompts = pgTable("legalprompt", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  prompt: text("prompt").notNull(),
  category: varchar("category", { length: 100 }),
  systemMessage: text("systemMessage"),
  status: promptStatusEnum("status").default("draft").notNull(),
  owner: varchar("owner", { length: 255 }).default("unassigned").notNull(),
  lastReviewedAt: timestamp("lastReviewedAt"),
  latestVersion: integer("latestVersion").default(1).notNull(),
  publishedVersion: integer("publishedVersion").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})

export const promptVersions = pgTable("prompt_versions", {
  id: serial("id").primaryKey(),
  promptId: integer("promptId")
    .references(() => prompts.id, { onDelete: "cascade" })
    .notNull(),
  versionNumber: integer("versionNumber").notNull(),
  prompt: text("prompt").notNull(),
  systemMessage: text("systemMessage"),
  status: promptStatusEnum("status").default("draft").notNull(),
  createdBy: varchar("createdBy", { length: 255 }).default("unknown").notNull(),
  diffSummary: text("diffSummary"),
  reviewedBy: varchar("reviewedBy", { length: 255 }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
})

export const promptUsageLogs = pgTable("prompt_usage_logs", {
  id: serial("id").primaryKey(),
  promptId: integer("promptId")
    .references(() => prompts.id, { onDelete: "cascade" })
    .notNull(),
  versionNumber: integer("versionNumber"),
  result: varchar("result", { length: 50 }).default("success").notNull(),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
})

export type Prompt = typeof prompts.$inferSelect
export type NewPrompt = typeof prompts.$inferInsert
export type PromptVersion = typeof promptVersions.$inferSelect

