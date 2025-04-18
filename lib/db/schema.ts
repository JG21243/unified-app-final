import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core"

// Define the table with the correct name "legalprompt"
export const prompts = pgTable("legalprompt", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  prompt: text("prompt").notNull(),
  category: varchar("category", { length: 100 }),
  systemMessage: text("systemMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})

export type Prompt = typeof prompts.$inferSelect
export type NewPrompt = typeof prompts.$inferInsert

