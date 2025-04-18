import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./db/schema"

// Make sure we're using the DATABASE_URL environment variable
// The error suggests this might not be properly set or accessed
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set. Please configure your database connection.")
}

// Create a SQL query executor using the Neon serverless driver
const neonClient = neon(DATABASE_URL)

// Create a drizzle instance with the neon client and our schema
export const db = drizzle(neonClient, { schema })

// Export the sql tagged template function from drizzle-orm
export { neonClient as sql }

// Helper function with timeout
export async function executeQueryWithTimeout<T>(queryFn: () => Promise<T>, timeout = 10000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Query timed out after ${timeout}ms`)), timeout)
  })

  // Race between the query and the timeout
  return Promise.race([queryFn(), timeoutPromise]) as Promise<T>
}

