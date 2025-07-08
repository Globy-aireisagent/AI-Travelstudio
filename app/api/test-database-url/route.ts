import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const { databaseUrl } = await request.json()

    if (!databaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "DATABASE_URL is required",
          setup_needed: true,
        },
        { status: 400 },
      )
    }

    // Test the connection with the provided URL
    const sql = neon(databaseUrl)

    // Basic connection test
    const connectionTest = await sql`SELECT NOW() as current_time, 'Connected!' as status`

    // Get table information
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    // Get record counts for each table
    const recordCounts: Record<string, number | string> = {}

    for (const table of tables) {
      try {
        const countResult = await sql`SELECT COUNT(*) as count FROM ${sql(table.table_name)}`
        recordCounts[table.table_name] = Number.parseInt(countResult[0].count)
      } catch (error) {
        recordCounts[table.table_name] = "Error counting"
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      timestamp: connectionTest[0].current_time,
      tables_found: tables.length,
      tables: tables.map((t) => t.table_name),
      record_counts: recordCounts,
    })
  } catch (error) {
    console.error("Database connection test failed:", error)

    let errorMessage = "Connection failed"
    let troubleshooting = [
      "Check if your DATABASE_URL format is correct",
      "Verify your Neon database is active",
      "Make sure the credentials are correct",
    ]

    if (error instanceof Error) {
      errorMessage = error.message

      if (error.message.includes("authentication")) {
        troubleshooting = [
          "Check your username and password in the DATABASE_URL",
          "Verify the database user has proper permissions",
          "Make sure the database exists",
        ]
      } else if (error.message.includes("connection")) {
        troubleshooting = [
          "Check if the hostname is correct",
          "Verify the port number (usually 5432)",
          "Make sure your Neon database is not paused",
        ]
      } else if (error.message.includes("SSL")) {
        troubleshooting = [
          "Make sure sslmode=require is in your connection string",
          "Check if SSL certificates are properly configured",
        ]
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        setup_needed: true,
        troubleshooting,
      },
      { status: 500 },
    )
  }
}
