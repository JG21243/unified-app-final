import { sql } from "@/lib/db"

/**
 * Execute a query with a timeout
 */
export async function executeQueryWithTimeout<T>(queryFn: () => Promise<T>, timeout = 10000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Query timed out after ${timeout}ms`)), timeout)
  })

  // Race between the query and the timeout
  return Promise.race([queryFn(), timeoutPromise]) as Promise<T>
}

/**
 * Execute a function within a transaction
 */
export async function withTransaction<T>(callback: (client: typeof sql) => Promise<T>): Promise<T> {
  // Note: Neon HTTP doesn't support transactions in the same way as pg
  // This is a simplified version that just passes the sql client
  return callback(sql)
}

