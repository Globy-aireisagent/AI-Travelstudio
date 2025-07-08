import { neon } from "@neondatabase/serverless"

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL

// Create SQL client if DATABASE_URL is available
export const sql = databaseUrl ? neon(databaseUrl) : null

/**
 * Wrap any DB call in a try/catch and always return a uniform result
 * so that pages and API routes don’t have to duplicate error-handling logic.
 */
export async function safeQuery<T = any>(
  query: () => Promise<T[]>,
  fallback: T[] = [],
): Promise<{ success: boolean; data: T[]; error?: string }> {
  if (!isDatabaseAvailable) {
    return { success: false, data: fallback, error: "Database not configured (demo mode)" }
  }

  try {
    const data = await query()
    return { success: true, data }
  } catch (err) {
    console.error("Neon query error:", err)
    return {
      success: false,
      data: fallback,
      error: err instanceof Error ? err.message : "Unknown database error",
    }
  }
}

// Check if database is available
export const isDatabaseAvailable = !!databaseUrl

// Demo mode fallback
export function createDemoClient() {
  console.warn("⚠️ Running in demo mode - no real database connection")
  return {
    query: async () => ({ rows: [], rowCount: 0 }),
    end: async () => {},
  }
}

// Get SQL client with fallback
export function getSqlClient() {
  if (!isDatabaseAvailable) {
    throw new Error("Database not available - check DATABASE_URL environment variable")
  }
  return sql!
}

// Test database connection
export async function testConnection() {
  try {
    if (!isDatabaseAvailable) {
      return {
        success: false,
        error: "DATABASE_URL not configured",
        demo: true,
      }
    }

    const result = await sql!`SELECT NOW() as current_time`
    return {
      success: true,
      timestamp: result[0]?.current_time,
      demo: false,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      demo: false,
    }
  }
}

// Get database info
export async function getDatabaseInfo() {
  try {
    if (!isDatabaseAvailable) {
      return {
        tables: [],
        demo: true,
      }
    }

    const tables = await sql!`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    const tableInfo = []
    for (const table of tables) {
      try {
        const countResult = await sql!`SELECT COUNT(*) as count FROM ${sql!.unsafe(table.table_name)}`
        tableInfo.push({
          name: table.table_name,
          columns: table.column_count,
          rows: Number.parseInt(countResult[0]?.count || "0"),
        })
      } catch (error) {
        tableInfo.push({
          name: table.table_name,
          columns: table.column_count,
          rows: 0,
          error: "Could not count rows",
        })
      }
    }

    return {
      tables: tableInfo,
      demo: false,
    }
  } catch (error) {
    return {
      tables: [],
      error: error instanceof Error ? error.message : "Unknown error",
      demo: false,
    }
  }
}
