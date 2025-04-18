// Environment variables with type safety
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  NODE_ENV: process.env.NODE_ENV || "development",
}

// Validate required environment variables
if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

