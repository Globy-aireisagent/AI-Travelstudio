import { neon } from "@neondatabase/serverless"

// Create Neon client with proper error handling
export function createNeonClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }

  return neon(process.env.DATABASE_URL)
}

// ------------------------
// Singleton SQL client
// ------------------------
export const sql = createNeonClient()

// Safe query execution with detailed error handling
export async function safeQuery<T = any>(
  queryFn: () => Promise<T[]>,
  fallback: T[] = [],
): Promise<{ success: boolean; data: T[]; error?: string }> {
  try {
    const data = await queryFn()
    return { success: true, data }
  } catch (error) {
    console.error("Database query failed:", error)

    let errorMessage = "Unknown database error"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return {
      success: false,
      data: fallback,
      error: errorMessage,
    }
  }
}

// Test connection with comprehensive error handling
export async function testNeonConnection() {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        error: "DATABASE_URL not configured",
        setup_needed: true,
      }
    }

    const sql = createNeonClient()
    const result = await sql`SELECT NOW() as current_time, 'Connected!' as status`

    return {
      success: true,
      data: result[0],
      timestamp: result[0].current_time,
    }
  } catch (error) {
    console.error("Connection test failed:", error)

    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
      setup_needed: true,
    }
  }
}

// Get table information
export async function getNeonTables() {
  try {
    const sql = createNeonClient()

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    return {
      success: true,
      data: tables.map((row) => row.table_name),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get tables",
      data: [],
    }
  }
}

// Execute raw SQL safely
export async function executeSQL(query: string, params: any[] = []) {
  try {
    const sql = createNeonClient()
    const result = await sql(query, params)
    return { success: true, data: result }
  } catch (error) {
    console.error("SQL execution failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "SQL execution failed",
      data: [],
    }
  }
}

// ------------------------
// Simple availability check
// ------------------------
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    // A lightweight query – doesn’t hit any user tables.
    await sql`SELECT 1`
    return true
  } catch {
    return false
  }
}
