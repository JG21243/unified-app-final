import * as z from "zod"

export const promptSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  category: z.string().min(1, {
    message: "Category is required.",
  }),
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
  systemMessage: z.string().optional(),
})

