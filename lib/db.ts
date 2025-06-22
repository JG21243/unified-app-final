import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./db/schema"

// Read the database URL from the environment. Some development setups may omit
// this variable, so we provide a graceful fallback rather than throwing during
// import which would break server actions.
// Use bracket notation so Next.js doesn't inline the value at build time.
// This ensures the variable is read at runtime and works in deployed
// environments like Vercel where the value may differ between build and
// runtime.
const DATABASE_URL = process.env["DATABASE_URL"] || process.env["POSTGRES_URL"]

let sql: ReturnType<typeof neon> | ((...args: any[]) => Promise<unknown[]>)
let db: ReturnType<typeof drizzle> | null

if (!DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Database features are disabled; using mock client.",
  )
  // Provide a mock sql function so calls fail gracefully
  sql = async (..._args: any[]) => {
    console.warn("Mock SQL called with:", _args[0])
    return []
  }
  db = null
} else {
  const neonClient = neon(DATABASE_URL)
  sql = neonClient
  db = drizzle(neonClient, { schema })
}

// Export the sql tagged template function and db instance (may be null)
export { sql, db }

// Helper function with timeout
export async function executeQueryWithTimeout<T>(queryFn: () => Promise<T>, timeout = 10000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Query timed out after ${timeout}ms`)), timeout)
  })

  // Race between the query and the timeout
  return Promise.race([queryFn(), timeoutPromise]) as Promise<T>
}

