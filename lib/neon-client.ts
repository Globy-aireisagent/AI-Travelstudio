import { neon } from "@neondatabase/serverless"

// Get database URL from environment
const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL

  if (!url) {
    console.warn("DATABASE_URL not found, using fallback mode")
    return null
  }

  // Clean up the URL if it has psql command prefix
  if (url.startsWith("psql '") && url.endsWith("'")) {
    url = url.slice(6, -1) // Remove "psql '" from start and "'" from end
  } else if (url.startsWith("psql ")) {
    url = url.slice(5) // Remove "psql " from start
  }

  // Remove any surrounding quotes
  url = url.replace(/^['"]|['"]$/g, "")

  return url
}

// Create SQL client
const createSqlClient = () => {
  const url = getDatabaseUrl()
  if (!url) {
    // Return a mock client for development/fallback
    return {
      unsafe: async (query: string, params: any[] = []) => {
        console.warn("Database not available, returning empty result")
        return { rows: [], rowCount: 0 }
      },
    } as any
  }

  try {
    return neon(url)
  } catch (error) {
    console.error("Failed to create Neon client:", error)
    // Return mock client as fallback
    return {
      unsafe: async (query: string, params: any[] = []) => {
        console.warn("Database connection failed, returning empty result")
        return { rows: [], rowCount: 0 }
      },
    } as any
  }
}

// Export the SQL client
export const sql = createSqlClient()

// Helper function to check if database is available
export const isDatabaseAvailable = () => {
  return getDatabaseUrl() !== null
}

// Safe query wrapper
export const safeQuery = async (queryFn: () => Promise<any>, fallback: any = []) => {
  try {
    if (!isDatabaseAvailable()) {
      return fallback
    }
    return await queryFn()
  } catch (error) {
    console.error("Database query failed:", error)
    return fallback
  }
}
