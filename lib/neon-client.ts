import { neon } from "@neondatabase/serverless"

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL

// Create SQL client if DATABASE_URL is available
export const sql = databaseUrl ? neon(databaseUrl) : null

// Check if database is available
export const isDatabaseAvailable = !!databaseUrl

// Get SQL client (throws if not available)
export function getSqlClient() {
  if (!sql) {
    throw new Error("Database not configured - check DATABASE_URL environment variable")
  }
  return sql
}

// Safe query wrapper that handles errors gracefully
export async function safeQuery(queryFn: () => Promise<any>) {
  if (!isDatabaseAvailable) {
    console.warn("⚠️ Database not available - returning empty result")
    return { success: false, data: null, error: "Database not configured" }
  }

  try {
    const data = await queryFn()
    return { success: true, data, error: null }
  } catch (error) {
    console.error("Database query failed:", error)
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

// Demo mode check
export function isDemoMode() {
  return !isDatabaseAvailable
}

// Connection test
export async function testConnection() {
  if (!isDatabaseAvailable) {
    return { success: false, error: "DATABASE_URL not configured" }
  }

  try {
    const result = await sql`SELECT 'Hello Neon!' as message, NOW() as current_time`
    return {
      success: true,
      message: result[0]?.message,
      timestamp: result[0]?.current_time,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    }
  }
}
